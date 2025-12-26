import { getSetting } from './settings.service'
import { defaultSettings } from './defaults'
import { env } from '@/lib/config/env'

export async function getAdminPhoneSetting(): Promise<string | null> {
  const dbPhone = await getSetting<string | null>('adminPhone', defaultSettings.adminPhone)
  return dbPhone ?? env.adminPhone ?? defaultSettings.adminPhone
}

export async function getSmsSenderSetting(): Promise<string> {
  const smsSettings = await getSetting<{ enabled: boolean; sender: string }>(
    'sms',
    defaultSettings.sms
  )
  return smsSettings.sender || defaultSettings.sms.sender
}

