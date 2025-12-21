'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/actions/auth.actions'

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
  createdAt: Date
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
    where,
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
    where,
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
    where,
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
    createdAt: req.createdAt,
  }))
}

