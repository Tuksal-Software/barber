'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/actions/auth.actions'
import { env } from '@/lib/config/env'

export interface SmsLogItem {
  id: string
  to: string
  message: string
  event: string
  provider: string
  status: string
  error: string | null
  createdAt: Date
  isAdmin: boolean
}

export async function getSmsLogs(limit: number = 50): Promise<SmsLogItem[]> {
  await requireAdmin()

  const logs = await prisma.smsLog.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      to: true,
      message: true,
      event: true,
      provider: true,
      status: true,
      error: true,
      createdAt: true,
    },
  })

  const { getAdminPhoneSetting } = await import('@/lib/settings/settings-helpers')
  const adminPhone = await getAdminPhoneSetting()

  return logs.map((log) => ({
    ...log,
    isAdmin: adminPhone ? log.to === adminPhone : false,
  }))
}

