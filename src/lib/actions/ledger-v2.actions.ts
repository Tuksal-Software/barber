'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/actions/auth.actions'
import { Prisma } from '@prisma/client'

export interface GetLedgerCandidatesParams {
  barberId?: string
  selectedDate: string
}

export interface UnpaidLedgerItem {
  appointmentId: string
  barberId: string
  barberName: string
  customerName: string
  date: string
  startTime: string
  endTime: string | null
  amount?: null
}

export interface PaidLedgerItem {
  appointmentId: string
  barberId: string
  barberName: string
  customerName: string
  date: string
  startTime: string
  endTime: string | null
  ledger: {
    id: string
    amount: string
    description: string | null
    createdAt: Date
  }
}

export interface GetLedgerCandidatesResult {
  unpaid: UnpaidLedgerItem[]
  paid: PaidLedgerItem[]
}

export async function getLedgerCandidates(
  params: GetLedgerCandidatesParams
): Promise<GetLedgerCandidatesResult> {
  const session = await requireAuth()
  const { barberId, selectedDate } = params

  let finalBarberId = barberId
  if (session.role === 'barber') {
    finalBarberId = session.userId
  }

  const where: Prisma.AppointmentRequestWhereInput = {
    status: 'approved',
    date: {
      lt: selectedDate,
    },
  }

  if (finalBarberId) {
    where.barberId = finalBarberId
  }

  const appointments = await prisma.appointmentRequest.findMany({
    where,
    include: {
      barber: {
        select: {
          id: true,
          name: true,
        },
      },
      appointmentSlots: {
        take: 1,
        orderBy: {
          startTime: 'asc',
        },
        select: {
          startTime: true,
          endTime: true,
        },
      },
      ledgerEntry: {
        select: {
          id: true,
          amount: true,
          description: true,
          createdAt: true,
        },
      },
    },
    orderBy: [
      { date: 'desc' },
      { requestedStartTime: 'desc' },
    ],
  })

  const unpaid: UnpaidLedgerItem[] = []
  const paid: PaidLedgerItem[] = []

  for (const appointment of appointments) {
    const startTime = appointment.appointmentSlots[0]
      ? appointment.appointmentSlots[0].startTime.slice(0, 5)
      : appointment.requestedStartTime.slice(0, 5)
    
    const endTime = appointment.appointmentSlots[0]
      ? appointment.appointmentSlots[0].endTime.slice(0, 5)
      : appointment.requestedEndTime
        ? appointment.requestedEndTime.slice(0, 5)
        : null

    const baseItem = {
      appointmentId: appointment.id,
      barberId: appointment.barberId,
      barberName: appointment.barber.name,
      customerName: appointment.customerName,
      date: appointment.date,
      startTime,
      endTime,
    }

    if (appointment.ledgerEntry) {
      paid.push({
        ...baseItem,
        ledger: {
          id: appointment.ledgerEntry.id,
          amount: appointment.ledgerEntry.amount.toString(),
          description: appointment.ledgerEntry.description,
          createdAt: appointment.ledgerEntry.createdAt,
        },
      })
    } else {
      unpaid.push(baseItem)
    }
  }

  return { unpaid, paid }
}

export interface UpsertLedgerInput {
  appointmentRequestId: string
  amount: number
  description?: string
}

export interface UpsertLedgerResult {
  success: boolean
  error?: string
}

export async function upsertLedgerForAppointment(
  input: UpsertLedgerInput
): Promise<UpsertLedgerResult> {
  try {
    const session = await requireAuth()
    const { appointmentRequestId, amount, description } = input

    if (amount <= 0) {
      return {
        success: false,
        error: 'Ücret 0\'dan büyük olmalıdır',
      }
    }

    const appointmentRequest = await prisma.appointmentRequest.findUnique({
      where: { id: appointmentRequestId },
      select: {
        id: true,
        barberId: true,
        status: true,
        date: true,
        customerName: true,
      },
    })

    if (!appointmentRequest) {
      return {
        success: false,
        error: 'Randevu bulunamadı',
      }
    }

    if (appointmentRequest.status !== 'approved') {
      return {
        success: false,
        error: 'Sadece onaylanmış randevular için ücret girilebilir',
      }
    }

    if (session.role === 'barber' && appointmentRequest.barberId !== session.userId) {
      return {
        success: false,
        error: 'Bu randevu için yetkiniz yok',
      }
    }

    await prisma.ledgerEntry.upsert({
      where: {
        appointmentRequestId: appointmentRequest.id,
      },
      create: {
        barberId: appointmentRequest.barberId,
        appointmentRequestId: appointmentRequest.id,
        date: appointmentRequest.date,
        customerName: appointmentRequest.customerName,
        amount: new Prisma.Decimal(amount),
        description: description || null,
      },
      update: {
        amount: new Prisma.Decimal(amount),
        description: description || null,
      },
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
    }
  }
}

