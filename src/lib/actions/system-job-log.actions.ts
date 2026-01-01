'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/actions/auth.actions'

export interface SmsDetail {
  id: string
  customerName: string
  customerPhone: string
  smsType: '2h' | '1h'
  appointmentDate: string
  appointmentTime: string
  sentAt: Date
}

export interface SystemJobLogItem {
  id: string
  jobName: string
  ranAt: Date
  meta: {
    totalApproved?: number
    reminders2hSent?: number
    reminders1hSent?: number
    reminders2hSkipped?: number
    reminders1hSkipped?: number
    errors?: number
  } | null
  smsDetails: SmsDetail[]
}

export interface SystemJobLogsResponse {
  latestJob: { ranAt: Date } | null
  jobsWithSms: SystemJobLogItem[]
}

export async function getSystemJobLogs(limit: number = 50): Promise<SystemJobLogsResponse> {
  await requireAdmin()

  const latestJob = await prisma.systemJobLog.findFirst({
    where: {
      jobName: 'appointment_reminders',
    },
    orderBy: {
      ranAt: 'desc',
    },
    select: {
      ranAt: true,
    },
  })

  const allLogs = await prisma.systemJobLog.findMany({
    where: {
      jobName: 'appointment_reminders',
    },
    take: limit * 2,
    orderBy: {
      ranAt: 'desc',
    },
    select: {
      id: true,
      jobName: true,
      ranAt: true,
      meta: true,
    },
  })

  const filteredLogs = allLogs.filter((log) => {
    const meta = log.meta as SystemJobLogItem['meta']
    if (!meta) return false
    const reminders2hSent = meta.reminders2hSent || 0
    const reminders1hSent = meta.reminders1hSent || 0
    return reminders2hSent + reminders1hSent > 0
  }).slice(0, limit)

  if (filteredLogs.length === 0) {
    return {
      latestJob: latestJob ? { ranAt: latestJob.ranAt } : null,
      jobsWithSms: [],
    }
  }

  const reminderEventRegex = /^APPOINTMENT_REMINDER_HOUR_([12])_(.+)$/

  const logsWithSms: SystemJobLogItem[] = []

  for (const log of filteredLogs) {
    const ranAt = new Date(log.ranAt)
    const windowStart = ranAt
    const windowEnd = new Date(ranAt.getTime() + 30 * 60 * 1000)

    const smsLogs = await prisma.smsLog.findMany({
      where: {
        event: {
          startsWith: 'APPOINTMENT_REMINDER_HOUR_',
        },
        createdAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        event: true,
        to: true,
        createdAt: true,
      },
    })

    const appointmentRequestIds: string[] = []

    smsLogs.forEach((smsLog) => {
      const match = smsLog.event.match(reminderEventRegex)
      if (match) {
        const appointmentRequestId = match[2]
        appointmentRequestIds.push(appointmentRequestId)
      }
    })

    const appointments = appointmentRequestIds.length > 0
      ? await prisma.appointmentRequest.findMany({
          where: {
            id: {
              in: [...new Set(appointmentRequestIds)],
            },
          },
          select: {
            id: true,
            customerName: true,
            customerPhone: true,
            date: true,
            requestedStartTime: true,
            appointmentSlots: {
              select: {
                startTime: true,
              },
              take: 1,
            },
          },
        })
      : []

    const appointmentMap = new Map(
      appointments.map((apt) => [apt.id, apt])
    )

    const smsDetails: SmsDetail[] = []

    smsLogs.forEach((smsLog) => {
      const match = smsLog.event.match(reminderEventRegex)
      if (match) {
        const hourType = match[1]
        const appointmentRequestId = match[2]
        const appointment = appointmentMap.get(appointmentRequestId)

        if (appointment) {
          const startTime = appointment.appointmentSlots?.[0]?.startTime || appointment.requestedStartTime
          smsDetails.push({
            id: smsLog.id,
            customerName: appointment.customerName,
            customerPhone: appointment.customerPhone,
            smsType: hourType === '2' ? '2h' : '1h',
            appointmentDate: appointment.date,
            appointmentTime: startTime,
            sentAt: smsLog.createdAt,
          })
        }
      }
    })

    logsWithSms.push({
      id: log.id,
      jobName: log.jobName,
      ranAt: log.ranAt,
      meta: log.meta as SystemJobLogItem['meta'],
      smsDetails,
    })
  }

  return {
    latestJob: latestJob ? { ranAt: latestJob.ranAt } : null,
    jobsWithSms: logsWithSms,
  }
}

