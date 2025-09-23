'use server'

import { prisma } from '@/lib/prisma'
import { Barber, WorkingHours } from '@/types'

export async function getBarbers(): Promise<{ success: boolean; data: Barber[] }> {
  try {
    const barbers = await prisma.barber.findMany({
      include: {
        workingHours: true,
        barberServices: { include: { service: true } },
      },
      orderBy: { name: 'asc' },
    })

    const data: Barber[] = barbers.map((barber) => {
      const workingHours: WorkingHours = {
        monday: { start: '09:00', end: '18:00', isWorking: true },
        tuesday: { start: '09:00', end: '18:00', isWorking: true },
        wednesday: { start: '09:00', end: '18:00', isWorking: true },
        thursday: { start: '09:00', end: '18:00', isWorking: true },
        friday: { start: '09:00', end: '18:00', isWorking: true },
        saturday: { start: '09:00', end: '16:00', isWorking: true },
        sunday: { start: '09:00', end: '16:00', isWorking: false },
      }

      barber.workingHours.forEach((wh) => {
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
        rating: barber.rating,
        specialties: JSON.parse(barber.specialties),
        image: barber.image,
        workingHours,
        services: barber.barberServices.map((bs) => bs.serviceId),
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
      where: { barberServices: { some: { serviceId } } },
      include: {
        workingHours: true,
        barberServices: { include: { service: true } },
      },
      orderBy: { name: 'asc' },
    })

    const data: Barber[] = barbers.map((barber) => {
      const workingHours: WorkingHours = {
        monday: { start: '09:00', end: '18:00', isWorking: true },
        tuesday: { start: '09:00', end: '18:00', isWorking: true },
        wednesday: { start: '09:00', end: '18:00', isWorking: true },
        thursday: { start: '09:00', end: '18:00', isWorking: true },
        friday: { start: '09:00', end: '18:00', isWorking: true },
        saturday: { start: '09:00', end: '16:00', isWorking: true },
        sunday: { start: '09:00', end: '16:00', isWorking: false },
      }

      barber.workingHours.forEach((wh) => {
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
        rating: barber.rating,
        specialties: JSON.parse(barber.specialties),
        image: barber.image,
        workingHours,
        services: barber.barberServices.map((bs) => bs.serviceId),
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
        experience: data.experience,
        rating: data.rating,
        specialties: JSON.stringify(data.specialties),
        image: data.image
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
        rating: data.rating,
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

export async function assignServiceToBarber(barberId: string, serviceId: string) {
  try {
    await prisma.barberService.create({
      data: {
        barberId,
        serviceId
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error assigning service to barber:', error)
    return { success: false, error: 'Hizmet atanamadı' }
  }
}

export async function removeServiceFromBarber(barberId: string, serviceId: string) {
  try {
    await prisma.barberService.delete({
      where: {
        barberId_serviceId: {
          barberId,
          serviceId
        }
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error removing service from barber:', error)
    return { success: false, error: 'Hizmet kaldırılamadı' }
  }
}