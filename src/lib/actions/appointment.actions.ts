'use server'

import { prisma } from '@/lib/prisma'
import { parseTimeToMinutes, minutesToTime } from '@/lib/time'
import { sendSms } from '@/lib/sms/sms.service'
import { requireAdmin } from '@/lib/actions/auth.actions'

export interface CreateAppointmentRequestInput {
  barberId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  date: string
  requestedStartTime: string
}

export interface ApproveAppointmentRequestInput {
  appointmentRequestId: string
  approvedDurationMinutes: 15 | 30 | 45 | 60
}

export interface CancelAppointmentRequestInput {
  appointmentRequestId: string
}

export interface RejectAppointmentRequestInput {
  appointmentRequestId: string
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
  } = input

  if (!barberId || !customerName || !customerPhone || !date || !requestedStartTime) {
    throw new Error('Tüm zorunlu alanlar doldurulmalıdır')
  }

  return await prisma.$transaction(async (tx) => {
    const barber = await tx.barber.findUnique({
      where: { id: barberId },
      select: { isActive: true },
    })

    if (!barber) {
      throw new Error('Berber bulunamadı')
    }

    if (!barber.isActive) {
      throw new Error('Berber aktif değil')
    }

    const appointmentRequest = await tx.appointmentRequest.create({
      data: {
        barberId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        date,
        requestedStartTime,
        requestedEndTime: null,
        status: 'pending',
      },
    })

    await sendSms(
      customerPhone,
      `Merhaba ${customerName}, randevu talebiniz alındı. Onay için bekliyoruz.`
    ).catch(() => {})

    return appointmentRequest.id
  })
}

export async function approveAppointmentRequest(
  input: ApproveAppointmentRequestInput
): Promise<void> {
  await requireAdmin()

  const { appointmentRequestId, approvedDurationMinutes } = input

  if (!appointmentRequestId || !approvedDurationMinutes) {
    throw new Error('Randevu talebi ID ve onaylanan süre gereklidir')
  }

  if (![15, 30, 45, 60].includes(approvedDurationMinutes)) {
    throw new Error('Geçersiz süre. 15, 30, 45 veya 60 dakika olmalıdır')
  }

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

    if (appointmentRequest.status !== 'pending') {
      throw new Error('Sadece bekleyen randevu talepleri onaylanabilir')
    }

    const requestedStartMinutes = parseTimeToMinutes(appointmentRequest.requestedStartTime)
    const approvedEndMinutes = requestedStartMinutes + approvedDurationMinutes

    const approvedStartTime = appointmentRequest.requestedStartTime
    const approvedEndTime = minutesToTime(approvedEndMinutes)

    const overlappingSlot = await tx.appointmentSlot.findFirst({
      where: {
        barberId: appointmentRequest.barberId,
        date: appointmentRequest.date,
        status: 'blocked',
        NOT: {
          appointmentRequestId: appointmentRequest.id,
        },
        AND: [
          {
            startTime: {
              lt: approvedEndTime,
            },
          },
          {
            endTime: {
              gt: approvedStartTime,
            },
          },
        ],
      },
    })

    if (overlappingSlot) {
      throw new Error('Seçilen zaman aralığı zaten dolu')
    }

    const existingSlot = appointmentRequest.appointmentSlots[0]
    if (existingSlot) {
      await tx.appointmentSlot.update({
        where: { id: existingSlot.id },
        data: {
          startTime: approvedStartTime,
          endTime: approvedEndTime,
        },
      })
    } else {
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
    }

    await tx.appointmentRequest.update({
      where: { id: appointmentRequestId },
      data: { status: 'approved' },
    })

    await sendSms(
      appointmentRequest.customerPhone,
      `Merhaba ${appointmentRequest.customerName}, randevunuz onaylandı. Tarih: ${appointmentRequest.date}, Saat: ${approvedStartTime}-${approvedEndTime}`
    ).catch(() => {})
  })
}

export async function rejectAppointmentRequest(
  input: RejectAppointmentRequestInput
): Promise<void> {
  await requireAdmin()

  const { appointmentRequestId } = input

  if (!appointmentRequestId) {
    throw new Error('Randevu talebi ID gereklidir')
  }

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

    if (appointmentRequest.status !== 'pending') {
      throw new Error('Sadece bekleyen randevu talepleri reddedilebilir')
    }

    await tx.appointmentSlot.deleteMany({
      where: {
        appointmentRequestId: appointmentRequest.id,
      },
    })

    await tx.appointmentRequest.update({
      where: { id: appointmentRequestId },
      data: { status: 'rejected' },
    })

    await sendSms(
      appointmentRequest.customerPhone,
      `Merhaba ${appointmentRequest.customerName}, randevu talebiniz reddedildi. Lütfen başka bir saat seçin.`
    ).catch(() => {})
  })
}

export async function cancelAppointmentRequest(
  input: CancelAppointmentRequestInput
): Promise<void> {
  await requireAdmin()

  const { appointmentRequestId } = input

  if (!appointmentRequestId) {
    throw new Error('Randevu talebi ID gereklidir')
  }

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

    await tx.appointmentSlot.deleteMany({
      where: {
        appointmentRequestId: appointmentRequest.id,
      },
    })

    await tx.appointmentRequest.update({
      where: { id: appointmentRequestId },
      data: { status: 'cancelled' },
    })

    await sendSms(
      appointmentRequest.customerPhone,
      `Merhaba ${appointmentRequest.customerName}, randevunuz iptal edildi.`
    ).catch(() => {})
  })
}

