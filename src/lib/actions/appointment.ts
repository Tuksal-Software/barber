'use server'

import { prisma } from '@/lib/prisma'
import type { Appointment, AppointmentStatus } from '@/types'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const appointmentSchema = z.object({
  customerName: z.string().min(2, 'Müşteri adı en az 2 karakter olmalı'),
  customerPhone: z.string().min(10, 'Telefon numarası geçerli değil'),
  customerEmail: z.string().optional(),
  notes: z.string().optional(),
  barberId: z.string().min(1, 'Berber seçiniz'),
  date: z.string().min(1, 'Tarih seçiniz'),
  startTime: z.string().min(1, 'Başlangıç saati seçiniz'),
  endTime: z.string().optional(), // hizmet bazlı sistemde hesaplanacak
  serviceIds: z.array(z.string()).optional(),
})

export async function createAppointment(data: z.infer<typeof appointmentSchema>) {
  try {
    const validatedData = appointmentSchema.parse(data)
    
    console.log('createAppointment - Gelen date:', validatedData.date)
    
    let appointmentDate: Date;
    
    if (validatedData.date.includes('T')) {
      appointmentDate = new Date(validatedData.date)
      appointmentDate.setHours(0, 0, 0, 0)
    } else {
      appointmentDate = new Date(validatedData.date + 'T00:00:00.000Z')
    }
    
    if (isNaN(appointmentDate.getTime())) {
      console.error('createAppointment - Geçersiz tarih:', validatedData.date)
      return { success: false, error: 'Geçersiz tarih formatı' }
    }
    
    console.log('createAppointment - Dönüştürülen date:', appointmentDate)
    console.log('createAppointment - Date ISO:', appointmentDate.toISOString())

    // Ayarlar ve hizmet bazlı sistem kontrolü
    const settings = await prisma.appointmentSettings.findFirst()

    let totalDuration: number | undefined
    let totalPrice: any | undefined
    let computedEndTime: string | undefined = validatedData.endTime

    if (settings?.serviceBasedDuration) {
      if (!validatedData.serviceIds || validatedData.serviceIds.length === 0) {
        return { success: false, error: 'En az bir hizmet seçilmelidir' }
      }

      const services = await prisma.service.findMany({
        where: { id: { in: validatedData.serviceIds }, isActive: true },
      })
      if (services.length !== validatedData.serviceIds.length) {
        return { success: false, error: 'Seçilen hizmetler geçerli değil' }
      }

      totalDuration = services.reduce((acc, s) => acc + s.duration, 0)
      totalPrice = services.reduce((acc, s) => acc + Number(s.price), 0)

      // Maksimum toplam süre kuralı (opsiyonel 180dk)
      if (totalDuration > 180) {
        return { success: false, error: 'Toplam süre 180 dakikayı aşamaz' }
      }

      computedEndTime = addMinutesToTime(validatedData.startTime, totalDuration)
    } else {
      // Eski sistem: barber.slotDuration veya verilen endTime
      if (!computedEndTime) {
        const barber = await prisma.barber.findUnique({ where: { id: validatedData.barberId } })
        const duration = barber?.slotDuration ?? settings?.slotDuration ?? 30
        computedEndTime = addMinutesToTime(validatedData.startTime, duration)
      }
    }

    // Çakışma kontrolü (aralık örtüşmesi)
    const overlap = await prisma.appointment.findFirst({
      where: {
        barberId: validatedData.barberId,
        date: appointmentDate,
        status: { not: 'cancelled' },
        OR: [
          {
            AND: [
              { startTime: { lte: validatedData.startTime } },
              { endTime: { gt: validatedData.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: computedEndTime! } },
              { endTime: { gte: computedEndTime! } },
            ],
          },
          {
            AND: [
              { startTime: { gte: validatedData.startTime } },
              { endTime: { lte: computedEndTime! } },
            ],
          },
        ],
      },
    })

    if (overlap) {
      return { success: false, error: 'Seçilen zaman aralığı dolu' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          customerName: validatedData.customerName,
          customerPhone: validatedData.customerPhone,
          customerEmail: validatedData.customerEmail,
          notes: validatedData.notes,
          barberId: validatedData.barberId,
          date: appointmentDate,
          startTime: validatedData.startTime,
          endTime: computedEndTime!,
          status: 'pending',
          totalDuration: totalDuration,
          totalPrice: totalPrice,
        },
      })

      if (settings?.serviceBasedDuration && validatedData.serviceIds?.length) {
        await Promise.all(
          validatedData.serviceIds.map((sid) =>
            tx.appointmentService.create({ data: { appointmentId: appointment.id, serviceId: sid } })
          )
        )
      }

      return appointment
    })

    console.log('createAppointment - Kaydedilen randevu:', result)

    revalidatePath('/admin/appointments')
    revalidatePath('/admin/randevular')
    return { success: true, appointment: result }
  } catch (error) {
    console.error('Error creating appointment:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Randevu oluşturulamadı' }
  }
}

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { barber: true },
      orderBy: { date: 'desc' }
    })

    return appointments.map((appointment: any) => ({
      id: appointment.id,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      customerEmail: appointment.customerEmail ?? undefined,
      serviceId: (appointment as any).serviceId,
      barberId: appointment.barberId,
      date: appointment.date,
      timeSlot: `${appointment.startTime}-${appointment.endTime}`,
      status: appointment.status as AppointmentStatus,
      notes: appointment.notes ?? undefined,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }))
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return []
  }
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus, notes?: string) {
  try {
    const updateData: any = { status: status as any }
    
    if (notes !== undefined) {
      updateData.notes = notes
    }

    await prisma.appointment.update({
      where: { id },
      data: updateData
    })

    revalidatePath('/admin/appointments')
    revalidatePath('/admin/randevular')
    return { success: true }
  } catch (error) {
    console.error('Error updating appointment status:', error)
    return { success: false, error: 'Randevu durumu güncellenemedi' }
  }
}

export async function deleteAppointment(id: string) {
  try {
    await prisma.appointment.delete({ where: { id } })
    revalidatePath('/admin/appointments')
    return { success: true }
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return { success: false, error: 'Randevu silinemedi' }
  }
}

export async function getBarberAvailability(barberId: string, date: string) {
  try {
    const appointmentDate = new Date(date)
    const params = new URLSearchParams({ date: appointmentDate.toISOString() })
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${base}/api/barbers/${barberId}/availability?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) {
      return { success: false, error: 'Müsaitlik API hatası' }
    }
    const data = await res.json()
    return { success: true, timeSlots: data.timeSlots as { time: string; isAvailable: boolean }[] }
  } catch (error) {
    console.error('Error getting barber availability:', error)
    return { success: false, error: 'Müsaitlik bilgisi alınamadı' }
  }
}

export async function getAppointmentsByWeek(startDate: Date, barberId?: string) {
  try {
    const normalizedStart = new Date(startDate)
    normalizedStart.setHours(0, 0, 0, 0)
    
    const normalizedEnd = new Date(startDate)
    normalizedEnd.setDate(startDate.getDate() + 6)
    normalizedEnd.setHours(23, 59, 59, 999)

    console.log('getAppointmentsByWeek - startDate:', normalizedStart.toISOString())
    console.log('getAppointmentsByWeek - endDate:', normalizedEnd.toISOString())
    console.log('getAppointmentsByWeek - barberId:', barberId)

    const whereClause: any = {}

    if (barberId && barberId !== 'all') {
      whereClause.barberId = barberId
    }

    const allAppointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        barber: true,
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    })

    console.log('getAppointmentsByWeek - total appointments in DB:', allAppointments.length)

    const filteredAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date)
      aptDate.setHours(0, 0, 0, 0)
      
      const isInRange = aptDate >= normalizedStart && aptDate <= normalizedEnd
      
      if (allAppointments.length > 0 && allAppointments.indexOf(apt) === 0) {
        console.log('First appointment check:', {
          aptDate: aptDate.toISOString(),
          normalizedStart: normalizedStart.toISOString(),
          normalizedEnd: normalizedEnd.toISOString(),
          isInRange
        })
      }
      
      return isInRange
    })

    console.log('getAppointmentsByWeek - filtered appointments:', filteredAppointments.length)
    if (filteredAppointments.length > 0) {
      console.log('Sample filtered appointment:', {
        date: filteredAppointments[0].date,
        startTime: filteredAppointments[0].startTime,
        customer: filteredAppointments[0].customerName
      })
    }

    return { success: true, data: filteredAppointments }
  } catch (error) {
    console.error('Error getting appointments by week:', error)
    return { success: false, error: 'Randevular yüklenirken hata oluştu' }
  }
}

export async function getAppointmentById(id: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        barber: true,
      },
    })

    if (!appointment) {
      return { success: false, error: 'Randevu bulunamadı' }
    }

    return { success: true, data: appointment }
  } catch (error) {
    console.error('Error getting appointment by id:', error)
    return { success: false, error: 'Randevu bilgileri yüklenirken hata oluştu' }
  }
}

export async function getAvailableSlots(barberId: string, date: Date, totalDuration?: number) {
  try {
    const [barber, settings] = await Promise.all([
      prisma.barber.findUnique({
      where: { id: barberId },
      include: {
        workingHours: true,
      },
    }),
      prisma.appointmentSettings.findFirst(),
    ])

    if (!barber) {
      return { success: false, error: 'Berber bulunamadı' }
    }

    const dayOfWeek = date.getDay()
    const workingHour = barber.workingHours.find(wh => wh.dayOfWeek === dayOfWeek)

    // Mevcut randevuları al
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
        status: { not: 'cancelled' },
      },
    })

    // Slot üretimi
    const slots: { time: string; isAvailable: boolean }[] = []
    const slotDuration = (settings?.serviceBasedDuration && totalDuration) ? totalDuration : (barber.slotDuration || 30)

    // Bugün mü kontrolü - Türkiye saati (UTC+3)
    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Istanbul"}))
    const isToday = date.toDateString() === now.toDateString()
    
    console.log('getAvailableSlots - Date:', date.toDateString())
    console.log('getAvailableSlots - Now (TR):', now.toDateString())
    console.log('getAvailableSlots - Is Today:', isToday)
    console.log('getAvailableSlots - Current Time (TR):', now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0'))

    // Çalışma saatinden başla
    const [workStartHour, workStartMin] = workingHour ? workingHour.startTime.split(':').map(Number) : [10, 0]
    const [workEndHour, workEndMin] = workingHour ? workingHour.endTime.split(':').map(Number) : [22, 0]

    let currentHour = workStartHour
    let currentMin = workStartMin

    while (currentHour * 60 + currentMin <= workEndHour * 60 + workEndMin) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
      const endTimeForSlot = addMinutesToTime(timeString, slotDuration)
      
      // Berberin çalışma saatleri içinde mi ve randevu çakışması var mı
      let isAvailable = false
      if (workingHour && workingHour.isWorking) {
        const slotTime = currentHour * 60 + currentMin
        const workStartTime = workStartHour * 60 + workStartMin
        const workEndTime = workEndHour * 60 + workEndMin
        
        // Slot, çalışma aralığına tamamen sığıyor mu
        const slotEndMins = toMinutes(endTimeForSlot)
        if (slotTime >= workStartTime && slotEndMins <= workEndTime) {
          const isBooked = existingAppointments.some(apt => rangesOverlap(timeString, endTimeForSlot, apt.startTime, apt.endTime))
          
          // Bugünse geçmiş saatleri kontrol et
          if (isToday) {
            const currentHour = now.getHours()
            const currentMinute = now.getMinutes()
            const currentTime = currentHour * 60 + currentMinute
            
            // Slot başlangıcı şu anki saatten küçük veya eşitse: isAvailable = false
            if (slotTime <= currentTime) {
              isAvailable = false
            } else {
              isAvailable = !isBooked
            }
          } else {
            isAvailable = !isBooked
          }
        }
      }
      
      slots.push({
        time: timeString,
        isAvailable,
      })

      // Sonraki slot'a geç
      currentMin += slotDuration
      if (currentMin >= 60) {
        currentMin = 0
        currentHour++
      }
    }

    return { success: true, data: slots }
  } catch (error) {
    console.error('Error getting available slots:', error)
    return { success: false, error: 'Müsait slotlar alınırken hata oluştu' }
  }
}

// Yardımcılar
function addMinutesToTime(startHHmm: string, minutesToAdd: number): string {
  const [h, m] = startHHmm.split(':').map(Number)
  const total = h * 60 + m + minutesToAdd
  const eh = Math.floor(total / 60)
  const em = total % 60
  return `${eh.toString().padStart(2,'0')}:${em.toString().padStart(2,'0')}`
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const aS = toMinutes(aStart)
  const aE = toMinutes(aEnd)
  const bS = toMinutes(bStart)
  const bE = toMinutes(bEnd)
  return aS < bE && bS < aE
}

export async function getAppointmentWithServices(id: string) {
  try {
    const data = await prisma.appointment.findUnique({
      where: { id },
      include: {
        barber: true,
        services: {
          include: { service: true }
        }
      }
    })
    if (!data) return { success: false as const, error: 'Randevu bulunamadı' }
    return { success: true as const, data }
  } catch (error) {
    console.error('Error getAppointmentWithServices:', error)
    return { success: false as const, error: 'Randevu detayları yüklenemedi' }
  }
}

export async function updateAppointment(
  id: string,
  data: {
    barberId?: string
    date?: string
    startTime?: string
    customerName?: string
    customerPhone?: string
    customerEmail?: string
    notes?: string
    status?: string
    serviceIds?: string[]
  }
) {
  try {
    const settings = await prisma.appointmentSettings.findFirst()
    const serviceBased = !!settings?.serviceBasedDuration

    const updateData: any = { ...data }

    if (data.date) {
      const d = new Date(data.date)
      d.setHours(0, 0, 0, 0)
      updateData.date = d
    }

    if (serviceBased && data.serviceIds && data.serviceIds.length > 0) {
      const services = await prisma.service.findMany({ where: { id: { in: data.serviceIds } } })
      const totalDuration = services.reduce((sum, s) => sum + s.duration, 0)
      const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0)
      updateData.totalDuration = totalDuration
      updateData.totalPrice = totalPrice

      if (data.startTime) {
        updateData.endTime = addMinutesToTime(data.startTime, totalDuration)
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({ where: { id }, data: updateData })
      if (serviceBased && data.serviceIds) {
        await tx.appointmentService.deleteMany({ where: { appointmentId: id } })
        if (data.serviceIds.length > 0) {
          await tx.appointmentService.createMany({
            data: data.serviceIds.map((sid) => ({ appointmentId: id, serviceId: sid })),
          })
        }
      }
    })

    revalidatePath('/admin/appointments')
    revalidatePath('/admin/randevular')
    return { success: true as const }
  } catch (error) {
    console.error('Update appointment error:', error)
    return { success: false as const, error: 'Randevu güncellenemedi' }
  }
}