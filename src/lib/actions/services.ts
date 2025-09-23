'use server'

import { prisma } from '@/lib/prisma'
import { Service } from '@/types'

export async function getServices(): Promise<{ success: boolean; data: Service[] }> {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: 'asc' }
    })
    
    const data: Service[] = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      image: service.image || undefined
    }))

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching services:', error)
    return { success: false, data: [] }
  }
}

export async function getServicesByCategory(category: string): Promise<{ success: boolean; data: Service[] }> {
  try {
    const services = await prisma.service.findMany({
      where: { category },
      orderBy: { name: 'asc' }
    })
    
    const data: Service[] = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      image: service.image || undefined
    }))

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching services by category:', error)
    return { success: false, data: [] }
  }
}

export async function createService(data: Omit<Service, 'id'>) {
  try {
    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        category: data.category,
        image: data.image
      }
    })
    
    return { success: true, service }
  } catch (error) {
    console.error('Error creating service:', error)
    return { success: false, error: 'Hizmet oluşturulamadı' }
  }
}

export async function updateService(id: string, data: Partial<Service>) {
  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        category: data.category,
        image: data.image
      }
    })
    
    return { success: true, service }
  } catch (error) {
    console.error('Error updating service:', error)
    return { success: false, error: 'Hizmet güncellenemedi' }
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.delete({
      where: { id }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting service:', error)
    return { success: false, error: 'Hizmet silinemedi' }
  }
}
