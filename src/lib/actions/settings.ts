import { prisma } from '@/lib/prisma'

type Settings = {
  maxAdvanceDays: number
  slotDuration: number
  serviceBasedDuration: boolean
}

export async function getAppointmentSettings(): Promise<{ success: boolean; data?: Settings; error?: string }> {
  try {
    const s = await prisma.appointmentSettings.findFirst({ where: { isActive: true } })
    if (!s) {
      return {
        success: true,
        data: { maxAdvanceDays: 30, slotDuration: 30, serviceBasedDuration: false },
      }
    }
    return {
      success: true,
      data: {
        maxAdvanceDays: s.maxAdvanceDays,
        slotDuration: s.slotDuration,
        serviceBasedDuration: false,
      },
    }
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to load settings' }
  }
}

export async function updateAppointmentSettings(input: Partial<Settings>): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.appointmentSettings.findFirst({ where: { isActive: true } })
    if (!existing) {
      await prisma.appointmentSettings.create({
        data: {
          slotDuration: input.slotDuration ?? 30,
          maxAdvanceDays: input.maxAdvanceDays ?? 30,
          isActive: true,
          slotDurationLabel: `${input.slotDuration ?? 30} Dakika`,
        },
      })
      return { success: true }
    }

    await prisma.appointmentSettings.update({
      where: { id: existing.id },
      data: {
        slotDuration: input.slotDuration ?? existing.slotDuration,
        maxAdvanceDays: input.maxAdvanceDays ?? existing.maxAdvanceDays,
        slotDurationLabel: `${input.slotDuration ?? existing.slotDuration} Dakika`,
      },
    })

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to update settings' }
  }
}


