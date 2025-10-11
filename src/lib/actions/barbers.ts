'use server'

import { prisma } from '@/lib/prisma'
import { Barber, WorkingHours } from '@/types'

export async function getBarbers(): Promise<{ success: boolean; data: Barber[] }> {
  try {
    const barbers = await prisma.barber.findMany({
      include: {
        workingHours: true,
      },
      orderBy: { name: 'asc' },
    })

    const data: Barber[] = barbers.map((barber: any) => {
      const workingHours: WorkingHours = {
        monday: { start: '09:00', end: '18:00', isWorking: true },
        tuesday: { start: '09:00', end: '18:00', isWorking: true },
        wednesday: { start: '09:00', end: '18:00', isWorking: true },
        thursday: { start: '09:00', end: '18:00', isWorking: true },
        friday: { start: '09:00', end: '18:00', isWorking: true },
        saturday: { start: '09:00', end: '16:00', isWorking: true },
        sunday: { start: '09:00', end: '16:00', isWorking: false },
      }

      barber.workingHours.forEach((wh: any) => {
        const dayKey = wh.dayOfWeek as keyof WorkingHours
        if (workingHours[dayKey]) {
          workingHours[dayKey] = {
            start: wh.startTime,
            end: wh.endTime,
            isWorking: wh.isWorking,
          }
        }
      })

      return {
        id: barber.id,
        name: barber.name,
        experience: barber.experience,
        rating: Number(barber.rating),
        specialties: barber.specialties ? JSON.parse(barber.specialties) : [],
        image: barber.image || '',
        workingHours,
        services: barber.barberServices ? barber.barberServices.map((bs: any) => bs.serviceId) : [],
      }
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching barbers:', error)
    return { success: false, data: [] }
  }
}

export async function getBarbersByService(serviceId: string): Promise<{ success: boolean; data: Barber[] }> {
  try {
    const barbers = await prisma.barber.findMany({
      where: { isActive: true },
      include: {
        workingHours: true,
      },
      orderBy: { name: 'asc' },
    })

    const data: Barber[] = barbers.map((barber: any) => {
      const workingHours: WorkingHours = {
        monday: { start: '09:00', end: '18:00', isWorking: true },
        tuesday: { start: '09:00', end: '18:00', isWorking: true },
        wednesday: { start: '09:00', end: '18:00', isWorking: true },
        thursday: { start: '09:00', end: '18:00', isWorking: true },
        friday: { start: '09:00', end: '18:00', isWorking: true },
        saturday: { start: '09:00', end: '16:00', isWorking: true },
        sunday: { start: '09:00', end: '16:00', isWorking: false },
      }

      barber.workingHours.forEach((wh: any) => {
        const dayKey = wh.dayOfWeek as keyof WorkingHours
        if (workingHours[dayKey]) {
          workingHours[dayKey] = {
            start: wh.startTime,
            end: wh.endTime,
            isWorking: wh.isWorking,
          }
        }
      })

      return {
        id: barber.id,
        name: barber.name,
        experience: barber.experience,
        rating: Number(barber.rating),
        specialties: barber.specialties ? JSON.parse(barber.specialties) : [],
        image: barber.image || '',
        workingHours,
        services: barber.barberServices ? barber.barberServices.map((bs: any) => bs.serviceId) : [],
      }
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching barbers by service:', error)
    return { success: false, data: [] }
  }
}

export async function createBarber(data: Omit<Barber, 'id'>) {
  try {
    const barber = await prisma.barber.create({
      data: {
        name: data.name,
        email: `${data.name.toLowerCase().replace(' ', '.')}@barber.com`,
        password: 'default123',
        experience: data.experience,
        rating: data.rating ? Number(data.rating) : undefined,
        specialties: JSON.stringify(data.specialties),
        image: data.image,
        slotDuration: 30
      }
    })
    
    return { success: true, barber }
  } catch (error) {
    console.error('Error creating barber:', error)
    return { success: false, error: 'Berber oluşturulamadı' }
  }
}

export async function updateBarber(id: string, data: Partial<Barber>) {
  try {
    const barber = await prisma.barber.update({
      where: { id },
      data: {
        name: data.name,
        experience: data.experience,
        rating: data.rating ? Number(data.rating) : undefined,
        specialties: data.specialties ? JSON.stringify(data.specialties) : undefined,
        image: data.image
      }
    })
    
    return { success: true, barber }
  } catch (error) {
    console.error('Error updating barber:', error)
    return { success: false, error: 'Berber güncellenemedi' }
  }
}

export async function deleteBarber(id: string) {
  try {
    await prisma.barber.delete({
      where: { id }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting barber:', error)
    return { success: false, error: 'Berber silinemedi' }
  }
}
