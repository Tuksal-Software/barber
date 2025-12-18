'use server'

import { prisma } from '@/lib/prisma'
import { parseTimeToMinutes, minutesToTime, overlaps } from '@/lib/time'

export interface AvailableTimeSlot {
  startTime: string
  endTime: string
}

export interface GetAvailableTimeSlotsParams {
  barberId: string
  date: string
}

export async function getAvailableTimeSlots(
  params: GetAvailableTimeSlotsParams
): Promise<AvailableTimeSlot[]> {
  const { barberId, date } = params

  if (!barberId || !date) {
    throw new Error('Berber ID ve tarih gereklidir')
  }

  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    throw new Error('Geçersiz tarih formatı')
  }

  const dayOfWeek = dateObj.getDay()

  const barber = await prisma.barber.findUnique({
    where: { id: barberId },
    select: { slotDuration: true, isActive: true },
  })

  if (!barber) {
    throw new Error('Berber bulunamadı')
  }

  if (!barber.isActive) {
    throw new Error('Berber aktif değil')
  }

  const workingHour = await prisma.workingHour.findUnique({
    where: {
      barberId_dayOfWeek: {
        barberId,
        dayOfWeek,
      },
    },
  })

  if (!workingHour) {
    return []
  }

  const slotDuration = barber.slotDuration
  const workStartMinutes = parseTimeToMinutes(workingHour.startTime)
  const workEndMinutes = parseTimeToMinutes(workingHour.endTime)

  const blockedSlots = await prisma.appointmentSlot.findMany({
    where: {
      barberId,
      date,
      status: 'blocked',
    },
    select: {
      startTime: true,
      endTime: true,
    },
  })

  const availableSlots: AvailableTimeSlot[] = []
  const now = new Date()
  const isToday = date === now.toISOString().split('T')[0]
  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : -1

  let currentSlotStart = workStartMinutes

  while (currentSlotStart + slotDuration <= workEndMinutes) {
    const currentSlotEnd = currentSlotStart + slotDuration
    const slotStartTime = minutesToTime(currentSlotStart)
    const slotEndTime = minutesToTime(currentSlotEnd)

    if (isToday && currentSlotStart < currentMinutes) {
      currentSlotStart += slotDuration
      continue
    }

    let isBlocked = false
    for (const blockedSlot of blockedSlots) {
      if (overlaps(slotStartTime, slotEndTime, blockedSlot.startTime, blockedSlot.endTime)) {
        isBlocked = true
        break
      }
    }

    if (!isBlocked) {
      availableSlots.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
      })
    }

    currentSlotStart += slotDuration
  }

  return availableSlots
}


