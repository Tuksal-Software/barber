'use server'

import { prisma } from '@/lib/prisma'

export interface BarberListItem {
  id: string
  name: string
  slotDuration: number
  isActive: boolean
}

export async function getActiveBarbers(): Promise<BarberListItem[]> {
  const barbers = await prisma.barber.findMany({
    where: {
      isActive: true,
      role: 'barber',
    },
    select: {
      id: true,
      name: true,
      slotDuration: true,
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return barbers
}


