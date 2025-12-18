'use server'

import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format, addDays } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { requireAuth } from '@/lib/actions/auth.actions'

export interface DashboardStats {
  pending: number
  approvedToday: number
  approvedTotal: number
  activeBarbers: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await requireAuth()
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)

  const baseWhere = session.role === 'barber' ? { barberId: session.userId } : {}

  const todayDateStr = format(today, 'yyyy-MM-dd')

  const [pending, approvedToday, approvedTotal, activeBarbers] = await Promise.all([
    prisma.appointmentRequest.count({
      where: {
        ...baseWhere,
        status: 'pending',
      },
    }),
    prisma.appointmentRequest.count({
      where: {
        ...baseWhere,
        status: 'approved',
        date: todayDateStr,
      },
    }),
    prisma.appointmentRequest.count({
      where: {
        ...baseWhere,
        status: 'approved',
      },
    }),
    prisma.barber.count({
      where: {
        isActive: true,
        role: 'barber',
      },
    }),
  ])

  return {
    pending,
    approvedToday,
    approvedTotal,
    activeBarbers,
  }
}

export interface WeeklyAppointmentData {
  day: string
  dayLabel: string
  count: number
}

export async function getWeeklyAppointments(): Promise<WeeklyAppointmentData[]> {
  const session = await requireAuth()
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  const baseWhere = session.role === 'barber' ? { barberId: session.userId } : {}

  const appointments = await prisma.appointmentRequest.findMany({
    where: {
      ...baseWhere,
      date: {
        gte: format(weekStart, 'yyyy-MM-dd'),
        lte: format(weekEnd, 'yyyy-MM-dd'),
      },
    },
    select: {
      date: true,
    },
  })

  const dayCounts: Record<string, number> = {}
  
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i)
    const dayStr = format(day, 'yyyy-MM-dd')
    dayCounts[dayStr] = 0
  }

  appointments.forEach((apt) => {
    if (dayCounts[apt.date] !== undefined) {
      dayCounts[apt.date]++
    }
  })

  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i)
    const dayStr = format(day, 'yyyy-MM-dd')
    return {
      day: dayStr,
      dayLabel: format(day, 'EEE', { locale: tr }),
      count: dayCounts[dayStr] || 0,
    }
  })
}

export interface AppointmentStatusStats {
  approved: number
  cancelled: number
}

export async function getAppointmentStatusStats(): Promise<AppointmentStatusStats> {
  const session = await requireAuth()
  const baseWhere = session.role === 'barber' ? { barberId: session.userId } : {}

  const [approved, cancelled] = await Promise.all([
    prisma.appointmentRequest.count({
      where: {
        ...baseWhere,
        status: 'approved',
      },
    }),
    prisma.appointmentRequest.count({
      where: {
        ...baseWhere,
        status: 'cancelled',
      },
    }),
  ])

  return {
    approved,
    cancelled,
  }
}

