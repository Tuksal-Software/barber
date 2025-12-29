'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/actions/auth.actions'
import { parseTimeToMinutes, minutesToTime } from '@/lib/time'

export interface AppointmentRequestListItem {
  id: string
  barberId: string
  barberName: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  date: string
  requestedStartTime: string
  requestedEndTime: string | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  cancelledBy: string | null
  createdAt: Date
  appointmentSlots?: Array<{
    startTime: string
    endTime: string
  }>
}

export async function getPendingAppointmentRequests(): Promise<AppointmentRequestListItem[]> {
  const session = await requireAuth()

  const where: {
    status: 'pending'
    barberId?: string
  } = {
    status: 'pending',
  }

  if (session.role === 'barber') {
    where.barberId = session.userId
  }

  const requests = await prisma.appointmentRequest.findMany({
    where: {
      ...where,
      subscriptionId: null,
    },
    include: {
      barber: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return requests.map((req) => ({
    id: req.id,
    barberId: req.barberId,
    barberName: req.barber.name,
    customerName: req.customerName,
    customerPhone: req.customerPhone,
    customerEmail: req.customerEmail,
    date: req.date,
    requestedStartTime: req.requestedStartTime,
    requestedEndTime: req.requestedEndTime,
    status: req.status,
    cancelledBy: req.cancelledBy,
    createdAt: req.createdAt,
  }))
}

export async function getRecentAppointments(limit: number = 5): Promise<AppointmentRequestListItem[]> {
  const session = await requireAuth()

  const where: {
    barberId?: string
  } = {}

  if (session.role === 'barber') {
    where.barberId = session.userId
  }

  const requests = await prisma.appointmentRequest.findMany({
    where: {
      ...where,
      subscriptionId: null,
    },
    include: {
      barber: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })

  return requests.map((req) => ({
    id: req.id,
    barberId: req.barberId,
    barberName: req.barber.name,
    customerName: req.customerName,
    customerPhone: req.customerPhone,
    customerEmail: req.customerEmail,
    date: req.date,
    requestedStartTime: req.requestedStartTime,
    requestedEndTime: req.requestedEndTime,
    status: req.status,
    cancelledBy: req.cancelledBy,
    createdAt: req.createdAt,
  }))
}

export async function getAllAppointmentRequests(): Promise<AppointmentRequestListItem[]> {
  const session = await requireAuth()

  const where: {
    barberId?: string
  } = {}

  if (session.role === 'barber') {
    where.barberId = session.userId
  }

  const requests = await prisma.appointmentRequest.findMany({
    where: {
      ...where,
      subscriptionId: null,
    },
    include: {
      barber: {
        select: {
          name: true,
        },
      },
      appointmentSlots: {
        select: {
          startTime: true,
          endTime: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return requests.map((req) => ({
    id: req.id,
    barberId: req.barberId,
    barberName: req.barber.name,
    customerName: req.customerName,
    customerPhone: req.customerPhone,
    customerEmail: req.customerEmail,
    date: req.date,
    requestedStartTime: req.requestedStartTime,
    requestedEndTime: req.requestedEndTime,
    status: req.status,
    cancelledBy: req.cancelledBy,
    createdAt: req.createdAt,
    appointmentSlots: req.appointmentSlots,
  }))
}

export interface CalendarAppointment {
  id: string
  barberId: string
  barberName: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  date: string
  startTime: string
  endTime: string
  status: 'approved' | 'pending' | 'rejected' | 'cancelled'
  subscriptionId?: string | null
}

export async function getCalendarAppointments(): Promise<CalendarAppointment[]> {
  const session = await requireAuth()

  const where: { barberId?: string } = {}
  if (session.role === 'barber') {
    where.barberId = session.userId
  }

  const requests = await prisma.appointmentRequest.findMany({
    where,
    include: {
      barber: { select: { name: true } },
      appointmentSlots: true,
    },
  })

  const norm = (t: string) => t.trim().slice(0, 5)

  return requests.map((req) => {
    if (req.status === 'approved' && req.appointmentSlots.length > 0) {
      const slot = req.appointmentSlots[0]
      return {
        id: req.id,
        barberId: req.barberId,
        barberName: req.barber.name,
        customerName: req.customerName,
        customerPhone: req.customerPhone,
        customerEmail: req.customerEmail,
        date: req.date,
        startTime: norm(slot.startTime),
        endTime: norm(slot.endTime),
        status: req.status,
        subscriptionId: req.subscriptionId,
      }
    }

    const start = norm(req.requestedStartTime)
    const end = req.requestedEndTime ? norm(req.requestedEndTime) : minutesToTime(parseTimeToMinutes(start) + 30)

    return {
      id: req.id,
      barberId: req.barberId,
      barberName: req.barber.name,
      customerName: req.customerName,
      customerPhone: req.customerPhone,
      customerEmail: req.customerEmail,
      date: req.date,
      startTime: start,
      endTime: end,
      status: req.status,
      subscriptionId: req.subscriptionId,
    }
  })
}

