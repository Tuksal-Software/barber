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
  endTime: z.string().min(1, 'Bitiş saati seçiniz'),
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

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId: validatedData.barberId,
        date: appointmentDate,
        startTime: validatedData.startTime,
        status: { not: 'cancelled' }
      }
    })

    if (existingAppointment) {
      return { success: false, error: 'Bu saatte başka bir randevu var' }
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail,
        notes: validatedData.notes,
        barberId: validatedData.barberId,
        date: appointmentDate,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        status: 'pending'
      }
    })

    console.log('createAppointment - Kaydedilen randevu:', appointment)

    revalidatePath('/admin/appointments')
    revalidatePath('/admin/randevular')
    return { success: true, appointment }
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
      serviceId: appointment.serviceId,
      barberId: appointment.barberId,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
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

export async function getAvailableSlots(barberId: string, date: Date) {
  try {
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      include: {
        workingHours: true,
      },
    })

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

    // Sabit 10:00-22:00 aralığında slot'lar oluştur
    const slots = []
    const fixedStartHour = 10 // 10:00
    const fixedEndHour = 22   // 22:00
    const slotDuration = barber.slotDuration || 30 // 30 dakika default

    // Bugün mü kontrolü
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    let currentHour = fixedStartHour
    let currentMin = 0

    while (currentHour < fixedEndHour || (currentHour === fixedEndHour && currentMin === 0)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
      
      // Berberin çalışma saatleri dışındaysa disabled
      let isAvailable = false
      if (workingHour && workingHour.isWorking) {
        const [workStartHour, workStartMin] = workingHour.startTime.split(':').map(Number)
        const [workEndHour, workEndMin] = workingHour.endTime.split(':').map(Number)
        
        const slotTime = currentHour * 60 + currentMin
        const workStartTime = workStartHour * 60 + workStartMin
        const workEndTime = workEndHour * 60 + workEndMin
        
        // Çalışma saatleri içindeyse ve dolu değilse müsait
        if (slotTime >= workStartTime && slotTime < workEndTime) {
          const isBooked = existingAppointments.some(apt => apt.startTime === timeString)
          
          // Bugünse geçmiş saatleri kontrol et
          if (isToday) {
            const currentHour = now.getHours()
            const currentMinute = now.getMinutes()
            const currentTime = currentHour * 60 + currentMinute
            
            // Slot'un saati şu anki saatten küçükse: isAvailable = false
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