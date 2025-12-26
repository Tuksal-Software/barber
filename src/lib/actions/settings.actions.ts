'use server'

import { z } from 'zod'
import { requireAdmin, getSession } from './auth.actions'
import { getSetting, setSetting, getAllSettings } from '@/lib/settings/settings.service'
import { defaultSettings } from '@/lib/settings/defaults'
import { env } from '@/lib/config/env'
import { auditLog } from '@/lib/audit/audit.logger'
import { AuditAction } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const updateSettingsSchema = z.object({
  adminPhone: z.string().nullable(),
  shopName: z.string().min(1),
  smsEnabled: z.boolean(),
  smsSender: z.string().min(1),
  approvedCancelMinHours: z.number().int().min(1).max(48),
  timezone: z.literal('Europe/Istanbul'),
})

export interface SettingsResponse {
  adminPhone: string | null
  shopName: string
  smsEnabled: boolean
  smsSender: string
  approvedCancelMinHours: number
  timezone: 'Europe/Istanbul'
}

export async function getSettings(): Promise<SettingsResponse> {
  await requireAdmin()

  const dbSettings = await getAllSettings()

  const adminPhone = (dbSettings.adminPhone as string | null) ?? env.adminPhone ?? defaultSettings.adminPhone
  const shopName = (dbSettings.shopName as string) ?? defaultSettings.shopName
  const sms = (dbSettings.sms as { enabled: boolean; sender: string }) ?? defaultSettings.sms
  const customerCancel = (dbSettings.customerCancel as { approvedMinHours: number }) ?? defaultSettings.customerCancel
  const timezone = ((dbSettings.timezone as string) ?? defaultSettings.timezone) as 'Europe/Istanbul'

  return {
    adminPhone,
    shopName,
    smsEnabled: sms.enabled,
    smsSender: sms.sender || defaultSettings.sms.sender,
    approvedCancelMinHours: customerCancel.approvedMinHours,
    timezone,
  }
}

export async function updateSettings(
  payload: z.infer<typeof updateSettingsSchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdmin()

  try {
    const validated = updateSettingsSchema.parse(payload)

    const oldSettings = await getAllSettings()

    await setSetting('adminPhone', validated.adminPhone, session.userId)
    await setSetting('shopName', validated.shopName, session.userId)
    await setSetting('sms', {
      enabled: validated.smsEnabled,
      sender: validated.smsSender,
    }, session.userId)
    await setSetting('customerCancel', {
      approvedMinHours: validated.approvedCancelMinHours,
    }, session.userId)
    await setSetting('timezone', validated.timezone, session.userId)

    try {
      await auditLog({
        actorType: 'admin',
        actorId: session.userId,
        action: AuditAction.SETTINGS_UPDATED,
        entityType: 'settings',
        entityId: null,
        summary: 'Settings updated',
        metadata: {
          oldValues: {
            adminPhone: oldSettings.adminPhone,
            shopName: oldSettings.shopName,
            sms: oldSettings.sms,
            customerCancel: oldSettings.customerCancel,
            timezone: oldSettings.timezone,
          },
          newValues: {
            adminPhone: validated.adminPhone,
            shopName: validated.shopName,
            sms: {
              enabled: validated.smsEnabled,
              sender: validated.smsSender,
            },
            customerCancel: {
              approvedMinHours: validated.approvedCancelMinHours,
            },
            timezone: validated.timezone,
          },
        },
      })
    } catch (error) {
      console.error('Audit log error:', error)
    }

    try {
      await auditLog({
        actorType: 'admin',
        actorId: session.userId,
        action: AuditAction.UI_SETTINGS_SAVED,
        entityType: 'ui',
        entityId: null,
        summary: 'Settings page saved',
        metadata: {},
      })
    } catch (error) {
      console.error('Audit log error:', error)
    }

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Geçersiz veri' }
    }
    return { success: false, error: 'Ayarlar kaydedilirken hata oluştu' }
  }
}

