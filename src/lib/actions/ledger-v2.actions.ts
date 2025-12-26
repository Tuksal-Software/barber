'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/actions/auth.actions'
import { Prisma } from '@prisma/client'
import { auditLog } from '@/lib/audit/audit.logger'

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

    const existingEntry = await prisma.ledgerEntry.findUnique({
      where: {
        appointmentRequestId: appointmentRequest.id,
      },
    })

    const isUpdate = !!existingEntry

    const ledgerEntry = await prisma.ledgerEntry.upsert({
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

    try {
      await auditLog({
        actorType: 'admin',
        actorId: session.userId,
        action: 'APPOINTMENT_CREATED' as any,
        entityType: 'ledger',
        entityId: ledgerEntry.id,
        summary: isUpdate ? 'Defter kaydı güncellendi' : 'Randevu için ücret girildi',
        metadata: {
          appointmentRequestId: appointmentRequest.id,
          amount,
          description: description || null,
        },
      })
    } catch {
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
    }
  }
}

export interface DeleteLedgerResult {
  success: boolean
  error?: string
}

export async function deleteLedgerEntry(
  appointmentRequestId: string
): Promise<DeleteLedgerResult> {
  try {
    const session = await requireAuth()

    const ledgerEntry = await prisma.ledgerEntry.findUnique({
      where: {
        appointmentRequestId,
      },
      include: {
        appointmentRequest: {
          select: {
            barberId: true,
          },
        },
      },
    })

    if (!ledgerEntry) {
      return {
        success: false,
        error: 'Kayıt bulunamadı',
      }
    }

    if (session.role === 'barber' && ledgerEntry.appointmentRequest?.barberId !== session.userId) {
      return {
        success: false,
        error: 'Bu kayıt için yetkiniz yok',
      }
    }

    await prisma.ledgerEntry.delete({
      where: {
        appointmentRequestId,
      },
    })

    try {
      await auditLog({
        actorType: 'admin',
        actorId: session.userId,
        action: 'APPOINTMENT_CANCELLED' as any,
        entityType: 'ledger',
        entityId: ledgerEntry.id,
        summary: 'Defter kaydı silindi',
        metadata: {
          appointmentRequestId,
          amount: ledgerEntry.amount.toString(),
        },
      })
    } catch {
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
    }
  }
}

export interface LedgerSummary {
  totalRevenue: string
  paidCount: number
  unpaidCount: number
}

export async function getLedgerSummary(
  params: GetLedgerCandidatesParams
): Promise<LedgerSummary> {
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

  const [appointments, paidEntries] = await Promise.all([
    prisma.appointmentRequest.count({
      where,
    }),
    prisma.ledgerEntry.findMany({
      where: {
        barberId: finalBarberId || undefined,
        appointmentRequest: {
          status: 'approved',
          date: {
            lt: selectedDate,
          },
        },
      },
      select: {
        amount: true,
      },
    }),
  ])

  const totalRevenue = paidEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.amount.toString()),
    0
  )

  return {
    totalRevenue: totalRevenue.toFixed(2),
    paidCount: paidEntries.length,
    unpaidCount: appointments - paidEntries.length,
  }
}

