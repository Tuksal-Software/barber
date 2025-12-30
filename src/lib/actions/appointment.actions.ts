'use server'

import { prisma } from '@/lib/prisma'
import { AuditAction, Prisma } from '@prisma/client'
import { parseTimeToMinutes, minutesToTime, overlaps } from '@/lib/time'
import { createAppointmentDateTimeTR, getNowTR } from '@/lib/time/appointmentDateTime'
import { sendSms } from '@/lib/sms/sms.service'
import { requireAdmin, getSession } from '@/lib/actions/auth.actions'
import { dispatchSms, sendSmsForEvent } from '@/lib/sms/sms.dispatcher'
import { SmsEvent } from '@/lib/sms/sms.events'
import type { AppointmentApprovedPayload } from '@/lib/sms/sms.templates'
import { auditLog } from '@/lib/audit/audit.logger'

export interface CreateAppointmentRequestInput {
  barberId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  date: string
  requestedStartTime: string
  requestedEndTime?: string
  serviceType?: string
  durationMinutes?: number
}

export interface ApproveAppointmentRequestInput {
  appointmentRequestId: string
  approvedDurationMinutes: 30 | 60
}

export interface CancelAppointmentRequestInput {
  appointmentRequestId: string
  reason?: string
}

export interface CreateAdminAppointmentInput {
  barberId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  date: string
  requestedStartTime: string
  durationMinutes: 30 | 60
}

export async function getCustomerByPhone(phone: string): Promise<{ customerName: string } | null> {
  if (!phone || !phone.startsWith('+90')) {
    return null
  }

  const appointment = await prisma.appointmentRequest.findFirst({
    where: {
      customerPhone: phone,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      customerName: true,
    },
  })

  return appointment ? { customerName: appointment.customerName } : null
}

export async function createAppointmentRequest(
  input: CreateAppointmentRequestInput
): Promise<string> {
  const {
    barberId,
    customerName,
    customerPhone,
    customerEmail,
    date,
    requestedStartTime,
    requestedEndTime,
    serviceType,
    durationMinutes,
  } = input

  try {
    await auditLog({
      actorType: 'customer',
      actorId: customerPhone,
      action: AuditAction.APPOINTMENT_CREATE_ATTEMPT,
      entityType: 'appointment',
      entityId: null,
      summary: 'Appointment creation attempted',
      metadata: {
        barberId,
        customerName,
        customerPhone,
        date,
        requestedStartTime,
        requestedEndTime,
        serviceType,
        durationMinutes,
      },
    })
  } catch (error) {
    console.error('Audit log error:', error)
  }

  if (!barberId || !customerName || !customerPhone || !date || !requestedStartTime) {
    throw new Error('Tüm zorunlu alanlar doldurulmalıdır')
  }

  const barber = await prisma.barber.findUnique({
    where: { id: barberId },
    select: { isActive: true },
  })

  if (!barber) {
    throw new Error('Berber bulunamadı')
  }

  if (!barber.isActive) {
    throw new Error('Berber aktif değil')
  }

  let calculatedEndTime: string | null = null
  if (durationMinutes && requestedStartTime) {
    const startMinutes = parseTimeToMinutes(requestedStartTime)
    const endMinutes = startMinutes + durationMinutes
    calculatedEndTime = minutesToTime(endMinutes)
  }

  const finalEndTime = requestedEndTime || calculatedEndTime

  const activeAppointments = await prisma.appointmentRequest.findMany({
    where: {
      customerPhone,
      status: {
        in: ['pending', 'approved'],
      },
    },
    select: {
      date: true,
      requestedStartTime: true,
    },
  })

  const nowTR = getNowTR()
  const futureAppointment = activeAppointments.find((appointment: { date: string; requestedStartTime: string }) => {
    const appointmentDateTime = createAppointmentDateTimeTR(appointment.date, appointment.requestedStartTime)
    return appointmentDateTime.getTime() > nowTR.getTime()
  })

  if (futureAppointment) {
    try {
      await auditLog({
        actorType: 'customer',
        actorId: customerPhone,
        action: AuditAction.APPOINTMENT_CANCEL_DENIED,
        entityType: 'appointment',
        entityId: null,
        summary: 'Appointment creation denied - active appointment exists',
        metadata: {
          reason: 'active_appointment_exists',
          existingAppointment: {
            date: futureAppointment.date,
            requestedStartTime: futureAppointment.requestedStartTime,
          },
        },
      })
    } catch (error) {
      console.error('Audit log error:', error)
    }
    throw new Error('Aktif bir randevunuz bulunduğu için yeni randevu alamazsınız.')
  }

  const appointmentRequest = await prisma.appointmentRequest.create({
    data: {
      barber: {
        connect: {
          id: barberId,
        },
      },
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      date,
      requestedStartTime,
      requestedEndTime: finalEndTime,
      serviceType: serviceType || null,
      status: 'pending',
    },
  })

  try {
    await auditLog({
      actorType: 'customer',
      action: AuditAction.APPOINTMENT_CREATED,
      entityType: 'appointment',
      entityId: appointmentRequest.id,
      summary: 'Appointment request created',
      metadata: {
        barberId,
        date,
        requestedStartTime,
        requestedEndTime: finalEndTime,
        customerName,
        customerPhone,
        serviceType,
        durationMinutes,
      },
    })
  } catch (error) {
    console.error('Audit log error:', error)
  }

  await dispatchSms(SmsEvent.AppointmentCreated, {
    customerName,
    customerPhone,
    barberId,
    date,
    requestedStartTime,
    requestedEndTime: finalEndTime || '',
    serviceType: serviceType || null,
  })

  return appointmentRequest.id
}

export async function approveAppointmentRequest(
  input: ApproveAppointmentRequestInput
): Promise<void> {
  const session = await requireAdmin()

  const { appointmentRequestId, approvedDurationMinutes } = input

  if (!appointmentRequestId || !approvedDurationMinutes) {
    throw new Error('Randevu talebi ID ve onaylanan süre gereklidir')
  }

  if (![30, 60].includes(approvedDurationMinutes)) {
    throw new Error('Geçersiz süre. 30 veya 60 dakika olmalıdır')
  }

  let smsPayload: AppointmentApprovedPayload | null = null

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const appointmentRequest = await tx.appointmentRequest.findUnique({
      where: { id: appointmentRequestId },
    })

    if (!appointmentRequest) {
      throw new Error('Randevu talebi bulunamadı')
    }

    if (appointmentRequest.status === 'cancelled') {
      throw new Error('İptal edilmiş randevu talepleri onaylanamaz')
    }

    if (appointmentRequest.status === 'approved') {
      await tx.appointmentSlot.deleteMany({
        where: {
          appointmentRequestId: appointmentRequest.id,
        },
      })
    }

    const startMinutes = parseTimeToMinutes(appointmentRequest.requestedStartTime)
    const endMinutes = startMinutes + approvedDurationMinutes
    const approvedStartTime = appointmentRequest.requestedStartTime
    const approvedEndTime = minutesToTime(endMinutes)

    const [existingBlockedSlots, overrides] = await Promise.all([
      tx.appointmentSlot.findMany({
        where: {
          barberId: appointmentRequest.barberId,
          date: appointmentRequest.date,
          status: 'blocked',
        },
        select: {
          startTime: true,
          endTime: true,
        },
      }),
      tx.workingHourOverride.findMany({
        where: {
          barberId: appointmentRequest.barberId,
          date: appointmentRequest.date,
        },
        select: {
          startTime: true,
          endTime: true,
        },
      }),
    ])

    for (const slot of existingBlockedSlots) {
      if (overlaps(approvedStartTime, approvedEndTime, slot.startTime, slot.endTime)) {
        throw new Error('Seçilen zaman aralığı zaten dolu')
      }
    }

    for (const override of overrides) {
      if (overlaps(approvedStartTime, approvedEndTime, override.startTime, override.endTime)) {
        throw new Error('Seçilen zaman aralığı kapatılmış saatler içeriyor')
      }
    }

    await tx.appointmentSlot.create({
      data: {
        barberId: appointmentRequest.barberId,
        appointmentRequestId: appointmentRequest.id,
        date: appointmentRequest.date,
        startTime: approvedStartTime,
        endTime: approvedEndTime,
        status: 'blocked',
      },
    })

    await tx.appointmentRequest.update({
      where: { id: appointmentRequestId },
      data: { status: 'approved' },
    })

    smsPayload = {
      customerName: appointmentRequest.customerName,
      customerPhone: appointmentRequest.customerPhone,
      date: appointmentRequest.date,
      startTime: approvedStartTime,
      endTime: approvedEndTime,
      serviceType: appointmentRequest.serviceType || null,
    }
  })

  if (smsPayload) {
    await dispatchSms(SmsEvent.AppointmentApproved, smsPayload)
  }

  try {
    await auditLog({
      actorType: 'admin',
      actorId: session.userId,
      action: AuditAction.APPOINTMENT_APPROVED,
      entityType: 'appointment',
      entityId: appointmentRequestId,
      summary: 'Appointment approved',
      metadata: smsPayload ? {
        approvedStartTime: (smsPayload as { startTime: string; endTime: string }).startTime,
        approvedEndTime: (smsPayload as { startTime: string; endTime: string }).endTime,
      } : null,
    })
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

export async function cancelAppointmentRequest(
  input: CancelAppointmentRequestInput
): Promise<void> {
  const session = await requireAdmin()

  const { appointmentRequestId, reason } = input

  if (!appointmentRequestId) {
    throw new Error('Randevu talebi ID gereklidir')
  }

  let smsPayload: {
    customerName: string
    customerPhone: string
    date: string
    time: string
    reason?: string | null
  } | null = null

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const appointmentRequest = await tx.appointmentRequest.findUnique({
      where: { id: appointmentRequestId },
      include: {
        appointmentSlots: true,
      },
    })

    if (!appointmentRequest) {
      throw new Error('Randevu talebi bulunamadı')
    }

    if (appointmentRequest.status === 'cancelled') {
      return
    }

    const appointmentStartTime = appointmentRequest.status === 'approved' && appointmentRequest.appointmentSlots.length > 0
      ? appointmentRequest.appointmentSlots[0].startTime
      : appointmentRequest.requestedStartTime
    const appointmentDateTime = createAppointmentDateTimeTR(appointmentRequest.date, appointmentStartTime)
    const nowTR = getNowTR()

    if (appointmentDateTime.getTime() <= nowTR.getTime()) {
      try {
        await auditLog({
          actorType: 'admin',
          actorId: session.userId,
          action: AuditAction.APPOINTMENT_CANCEL_DENIED,
          entityType: 'appointment',
          entityId: appointmentRequestId,
          summary: 'Appointment cancel denied - past appointment',
          metadata: {
            reason: 'past_appointment',
            date: appointmentRequest.date,
            time: appointmentStartTime,
            appointmentDateTime: appointmentDateTime.toISOString(),
            now: nowTR.toISOString(),
          },
        })
      } catch (error) {
        console.error('Audit log error:', error)
      }
      throw new Error('Geçmiş randevular iptal edilemez')
    }

    const wasPending = appointmentRequest.status === 'pending'

    if (appointmentRequest.status === 'approved') {
      await tx.appointmentSlot.deleteMany({
        where: {
          appointmentRequestId: appointmentRequest.id,
        },
      })
    }

    await tx.appointmentRequest.update({
      where: { id: appointmentRequestId },
      data: {
        status: 'cancelled',
        cancelledBy: 'admin' as any,
      },
    })

    smsPayload = {
      customerName: appointmentRequest.customerName,
      customerPhone: appointmentRequest.customerPhone,
      date: appointmentRequest.date,
      time: appointmentRequest.requestedStartTime,
      reason: reason || null,
    }
  })

  if (smsPayload) {
    await dispatchSms(SmsEvent.AppointmentCancelledPending, smsPayload)
  }

  try {
    const appointmentRequest = await prisma.appointmentRequest.findUnique({
      where: { id: appointmentRequestId },
      select: { status: true },
    })

    try {
      await auditLog({
        actorType: 'admin',
        actorId: session.userId,
        action: AuditAction.APPOINTMENT_CANCELLED,
        entityType: 'appointment',
        entityId: appointmentRequestId,
        summary: 'Appointment cancelled',
        metadata: {
          previousStatus: appointmentRequest?.status,
          reason: reason || null,
        },
      })
    } catch (error) {
      console.error('Audit log error:', error)
    }
  } catch {
  }
}

export async function createAdminAppointment(
  input: CreateAdminAppointmentInput
): Promise<string> {
  const session = await requireAdmin()

  const {
    barberId,
    customerName,
    customerPhone,
    customerEmail,
    date,
    requestedStartTime,
    durationMinutes,
  } = input

  if (!barberId || !customerName || !customerPhone || !date || !requestedStartTime || !durationMinutes) {
    throw new Error('Tüm zorunlu alanlar doldurulmalıdır')
  }

  if (![30, 60].includes(durationMinutes)) {
    throw new Error('Geçersiz süre. 30 veya 60 dakika olmalıdır')
  }

  const barber = await prisma.barber.findUnique({
    where: { id: barberId },
    select: { isActive: true },
  })

  if (!barber) {
    throw new Error('Berber bulunamadı')
  }

  if (!barber.isActive) {
    throw new Error('Berber aktif değil')
  }

  const startMinutes = parseTimeToMinutes(requestedStartTime)
  const endMinutes = startMinutes + durationMinutes
  const approvedEndTime = minutesToTime(endMinutes)

  const appointmentRequest = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const [existingBlockedSlots, overrides] = await Promise.all([
      tx.appointmentSlot.findMany({
        where: {
          barberId,
          date,
          status: 'blocked',
        },
        select: {
          startTime: true,
          endTime: true,
        },
      }),
      tx.workingHourOverride.findMany({
        where: {
          barberId,
          date,
        },
        select: {
          startTime: true,
          endTime: true,
        },
      }),
    ])

    for (const slot of existingBlockedSlots) {
      if (overlaps(requestedStartTime, approvedEndTime, slot.startTime, slot.endTime)) {
        throw new Error('Seçilen zaman aralığı zaten dolu')
      }
    }

    for (const override of overrides) {
      if (overlaps(requestedStartTime, approvedEndTime, override.startTime, override.endTime)) {
        throw new Error('Seçilen zaman aralığı kapatılmış saatler içeriyor')
      }
    }

    const appointmentRequest = await tx.appointmentRequest.create({
      data: {
        barber: {
          connect: {
            id: barberId,
          },
        },
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        date,
        requestedStartTime,
        requestedEndTime: approvedEndTime,
        status: 'approved',
      },
    })

    await tx.appointmentSlot.create({
      data: {
        barberId,
        appointmentRequestId: appointmentRequest.id,
        date,
        startTime: requestedStartTime,
        endTime: approvedEndTime,
        status: 'blocked',
      },
    })

    return appointmentRequest
  })

  try {
    await auditLog({
      actorType: 'admin',
      actorId: session.userId,
      action: AuditAction.ADMIN_APPOINTMENT_CREATED,
      entityType: 'appointment',
      entityId: appointmentRequest.id,
      summary: 'Admin appointment created',
      metadata: {
        barberId,
        customerName,
        customerPhone,
        date,
        requestedStartTime,
        approvedEndTime,
        source: 'ADMIN_MANUAL',
        createdBy: 'admin',
        approvedBy: 'admin',
      },
    })
  } catch (error) {
    console.error('Audit log error:', error)
  }

  console.log('[createAdminAppointment] Transaction completed, sending SMS...')
  console.log('[createAdminAppointment] SMS params:', {
    customerName,
    customerPhone,
    date,
    startTime: requestedStartTime,
    endTime: approvedEndTime,
  })

  await sendSmsForEvent({
    event: SmsEvent.AdminAppointmentCreated,
    to: customerPhone,
    payload: {
      customerName,
      date,
      startTime: requestedStartTime,
      endTime: approvedEndTime,
    },
  })

  console.log('[createAdminAppointment] SMS send completed')

  return appointmentRequest.id
}

