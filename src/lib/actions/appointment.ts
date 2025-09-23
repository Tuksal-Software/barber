'use server'

import { prisma } from '@/lib/prisma'
import type { Appointment, AppointmentStatus } from '@/types'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { AppointmentStatus as PrismaAppointmentStatus } from '@prisma/client'

const appointmentSchema = z.object({
  customerName: z.string().min(2, 'Müşteri adı en az 2 karakter olmalı'),
  customerPhone: z.string().min(10, 'Telefon numarası geçerli değil'),
  customerEmail: z.string().email('Geçerli email adresi giriniz').optional(),
  serviceId: z.string().min(1, 'Hizmet seçiniz'),
  barberId: z.string().min(1, 'Berber seçiniz'),
  date: z.string().min(1, 'Tarih seçiniz'),
  timeSlot: z.string().min(1, 'Saat seçiniz'),
  notes: z.string().optional()
})

export async function createAppointment(data: z.infer<typeof appointmentSchema>) {
  try {
    const validatedData = appointmentSchema.parse(data)
    const appointmentDate = new Date(validatedData.date)

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId: validatedData.barberId,
        date: appointmentDate,
        timeSlot: validatedData.timeSlot,
        status: { not: PrismaAppointmentStatus.CANCELLED }
      }
    })

    if (existingAppointment) {
      return { success: false, error: 'Bu saatte başka bir randevu var' }
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail ?? undefined,
        serviceId: validatedData.serviceId,
        barberId: validatedData.barberId,
        date: appointmentDate,
        timeSlot: validatedData.timeSlot,
        notes: validatedData.notes ?? undefined,
        status: PrismaAppointmentStatus.PENDING
      }
    })

    revalidatePath('/admin/appointments')
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
      include: { service: true, barber: true },
      orderBy: { date: 'desc' }
    })

    return appointments.map(appointment => ({
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

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  try {
    await prisma.appointment.update({
      where: { id },
      data: { status: status as unknown as PrismaAppointmentStatus }
    })

    revalidatePath('/admin/appointments')
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