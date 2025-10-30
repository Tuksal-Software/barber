import { prisma } from '@/lib/prisma'
export async function getActiveServices(): Promise<{ success: boolean; data: any[]; error?: string }> {
  try {
    const data = await prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })
    return { success: true, data }
  } catch (e: any) {
    return { success: false, data: [], error: e?.message }
  }
}

export async function getServices(): Promise<{ success: boolean; data: any[]; error?: string }> {
  try {
    const data = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } })
    return { success: true, data }
  } catch (e: any) {
    return { success: false, data: [], error: e?.message }
  }
}

export async function createService(input: { name: string; description?: string; duration: number; price: number; category?: string; isActive?: boolean }): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const maxSort = await prisma.service.aggregate({ _max: { sortOrder: true } })
    const created = await prisma.service.create({
      data: {
        name: input.name,
        description: input.description,
        duration: input.duration,
        price: input.price,
        category: input.category,
        isActive: input.isActive ?? true,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    })
    return { success: true, data: created }
  } catch (e: any) {
    return { success: false, error: e?.message }
  }
}

export async function updateService(id: string, input: Partial<{ name: string; description: string; duration: number; price: number; category: string; isActive: boolean }>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const updated = await prisma.service.update({ where: { id }, data: input })
    return { success: true, data: updated }
  } catch (e: any) {
    return { success: false, error: e?.message }
  }
}

export async function reorderServices(idsInOrder: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(
      idsInOrder.map((id, index) => prisma.service.update({ where: { id }, data: { sortOrder: index + 1 } }))
    )
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message }
  }
}

export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.service.delete({ where: { id } })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message }
  }
}


