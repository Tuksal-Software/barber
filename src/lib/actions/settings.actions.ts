'use server'

import { z } from 'zod'
import { requireAdmin } from './auth.actions'
import { getSetting, setSetting, getAllSettings } from '@/lib/settings/settings.service'
import { defaultSettings } from '@/lib/settings/defaults'
import { env } from '@/lib/config/env'

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
  await requireAdmin()

  try {
    const validated = updateSettingsSchema.parse(payload)

    await setSetting('adminPhone', validated.adminPhone)
    await setSetting('shopName', validated.shopName)
    await setSetting('sms', {
      enabled: validated.smsEnabled,
      sender: validated.smsSender,
    })
    await setSetting('customerCancel', {
      approvedMinHours: validated.approvedCancelMinHours,
    })
    await setSetting('timezone', validated.timezone)

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Geçersiz veri' }
    }
    return { success: false, error: 'Ayarlar kaydedilirken hata oluştu' }
  }
}

