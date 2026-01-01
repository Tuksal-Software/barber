'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/actions/auth.actions'

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
}

export async function getSystemJobLogs(limit: number = 50): Promise<SystemJobLogItem[]> {
  await requireAdmin()

  const logs = await prisma.systemJobLog.findMany({
    where: {
      jobName: 'appointment_reminders',
    },
    take: limit,
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

  return logs.map((log: { id: string; jobName: string; ranAt: Date; meta: unknown }) => ({
    ...log,
    meta: log.meta as SystemJobLogItem['meta'],
  }))
}

