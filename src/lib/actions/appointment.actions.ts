'use server'

import { prisma } from '@/lib/prisma'
import { AuditAction } from '@prisma/client'
import { parseTimeToMinutes, minutesToTime, overlaps } from '@/lib/time'
import { sendSms } from '@/lib/sms/sms.service'
import { requireAdmin, getSession } from '@/lib/actions/auth.actions'
import { dispatchSms } from '@/lib/sms/sms.dispatcher'
import { SmsEvent } from '@/lib/sms/sms.events'
import { auditLog } from '@/lib/audit/audit.logger'

export interface CreateAppointmentRequestInput {
  barberId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  date: string
  requestedStartTime: string
  requestedEndTime?: string
}

export interface ApproveAppointmentRequestInput {
  appointmentRequestId: string
  approvedDurationMinutes: 15 | 30 | 45 | 60
}

export interface CancelAppointmentRequestInput {
  appointmentRequestId: string
  reason?: string
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
  } = input

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

  const now = new Date()
  const futureAppointment = activeAppointments.find((appointment) => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.requestedStartTime}:00`)
    return appointmentDateTime > now
  })

  if (futureAppointment) {
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
      requestedEndTime: requestedEndTime ?? null,
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
        requestedEndTime,
        customerName,
        customerPhone,
      },
    })
  } catch {
  }

  await dispatchSms(SmsEvent.AppointmentCreated, {
    customerName,
    customerPhone,
    barberId,
    date,
    requestedStartTime,
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

  if (![15, 30, 45, 60].includes(approvedDurationMinutes)) {
    throw new Error('Geçersiz süre. 15, 30, 45 veya 60 dakika olmalıdır')
  }

  let smsPayload: {
    customerName: string
    customerPhone: string
    date: string
    startTime: string
    endTime: string
  } | null = null

  await prisma.$transaction(async (tx) => {
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

    const existingBlockedSlots = await tx.appointmentSlot.findMany({
      where: {
        barberId: appointmentRequest.barberId,
        date: appointmentRequest.date,
        status: 'blocked',
      },
      select: {
        startTime: true,
        endTime: true,
      },
    })

    for (const slot of existingBlockedSlots) {
      if (overlaps(approvedStartTime, approvedEndTime, slot.startTime, slot.endTime)) {
        throw new Error('Seçilen zaman aralığı zaten dolu')
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
      metadata: {
        approvedStartTime: smsPayload?.startTime,
        approvedEndTime: smsPayload?.endTime,
      },
    })
  } catch {
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

  await prisma.$transaction(async (tx) => {
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

    const now = new Date()
    const appointmentStartTime = appointmentRequest.status === 'approved' && appointmentRequest.appointmentSlots.length > 0
      ? appointmentRequest.appointmentSlots[0].startTime
      : appointmentRequest.requestedStartTime
    const appointmentDateTime = new Date(`${appointmentRequest.date}T${appointmentStartTime}:00`)

    if (appointmentDateTime <= now) {
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
      data: { status: 'cancelled' },
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
  } catch {
  }
}

