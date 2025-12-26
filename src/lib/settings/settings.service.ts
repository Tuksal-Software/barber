import { prisma } from '@/lib/prisma'
import { defaultSettings } from './defaults'
import { Prisma } from '@prisma/client'

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key },
    })
    if (setting) {
      return setting.value as T
    }
  } catch (error) {
    console.error(`[Settings] Error getting setting ${key}:`, error)
  }
  return fallback
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const jsonValue = value === null ? Prisma.JsonNull : value
  await prisma.appSetting.upsert({
    where: { key },
    create: {
      key,
      value: jsonValue as Prisma.InputJsonValue,
    },
    update: {
      value: jsonValue as Prisma.InputJsonValue,
    },
  })
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const settings = await prisma.appSetting.findMany()
  const result: Record<string, unknown> = {}
  for (const setting of settings) {
    result[setting.key] = setting.value
  }
  return result
}

export async function ensureDefaultSettings(): Promise<void> {
  const existingSettings = await prisma.appSetting.findMany({
    select: { key: true },
  })
  const existingKeys = new Set(existingSettings.map((s) => s.key))

  if (!existingKeys.has('adminPhone')) {
    await prisma.appSetting.upsert({
      where: { key: 'adminPhone' },
      create: {
        key: 'adminPhone',
        value: defaultSettings.adminPhone === null ? Prisma.JsonNull : defaultSettings.adminPhone,
      },
      update: {},
    })
  }

  if (!existingKeys.has('shopName')) {
    await prisma.appSetting.upsert({
      where: { key: 'shopName' },
      create: {
        key: 'shopName',
        value: defaultSettings.shopName,
      },
      update: {},
    })
  }

  if (!existingKeys.has('sms')) {
    await prisma.appSetting.upsert({
      where: { key: 'sms' },
      create: {
        key: 'sms',
        value: defaultSettings.sms,
      },
      update: {},
    })
  }

  if (!existingKeys.has('customerCancel')) {
    await prisma.appSetting.upsert({
      where: { key: 'customerCancel' },
      create: {
        key: 'customerCancel',
        value: defaultSettings.customerCancel,
      },
      update: {},
    })
  }

  if (!existingKeys.has('timezone')) {
    await prisma.appSetting.upsert({
      where: { key: 'timezone' },
      create: {
        key: 'timezone',
        value: defaultSettings.timezone,
      },
      update: {},
    })
  }
}

