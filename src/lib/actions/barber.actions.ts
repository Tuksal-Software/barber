"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBarbers() {
  try {
    const barbers = await prisma.barber.findMany({
      where: {
        role: 'barber',
      },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Decimal türünü number'a çevir
    const transformedBarbers = barbers.map(barber => ({
      ...barber,
      rating: Number(barber.rating)
    }));

    return {
      success: true,
      data: transformedBarbers,
    };
  } catch (error) {
    console.error("Get barbers error:", error);
    return {
      success: false,
      error: "Berberler yüklenirken hata oluştu",
    };
  }
}

export async function getActiveBarbers() {
  try {
    const barbers = await prisma.barber.findMany({
      where: { 
        isActive: true,
        role: 'barber',
      },
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        name: true,
        image: true,
        specialties: true,
        experience: true,
        rating: true,
        slotDuration: true,
      },
    });
    
    // Decimal türünü number'a çevir
    const transformedBarbers = barbers.map(barber => ({
      ...barber,
      rating: Number(barber.rating)
    }));
    
    return { success: true, data: transformedBarbers };
  } catch (error) {
    console.error("Get active barbers error:", error);
    return { success: false, error: 'Berberler yüklenemedi' };
  }
}

export async function getBarberById(id: string) {
  try {
    const barber = await prisma.barber.findUnique({
      where: { id },
      include: {
        workingHours: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        appointments: {
          take: 10,
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!barber) {
      return {
        success: false,
        error: "Berber bulunamadı",
      };
    }

    // Decimal türünü number'a çevir
    const transformedBarber = {
      ...barber,
      rating: Number(barber.rating)
    };

    return {
      success: true,
      data: transformedBarber,
    };
  } catch (error) {
    console.error("Get barber by id error:", error);
    return {
      success: false,
      error: "Berber bilgileri yüklenirken hata oluştu",
    };
  }
}

export async function createBarber(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  experience: number;
  specialties?: string;
  image?: string;
  slotDuration: number;
  workingHours?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorking: boolean;
  }>;
}) {
  try {
    const existingBarber = await prisma.barber.findUnique({
      where: { email: data.email },
    });

    if (existingBarber) {
      return {
        success: false,
        error: "Bu email adresi zaten kullanılıyor",
      };
    }

    const barber = await prisma.barber.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        experience: data.experience,
        specialties: data.specialties,
        image: data.image,
        slotDuration: data.slotDuration,
      },
    });

    const workingHoursToCreate = data.workingHours || [
      { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isWorking: true },
      { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isWorking: true },
      { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isWorking: true },
      { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isWorking: true },
      { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isWorking: true },
      { dayOfWeek: 6, startTime: "09:00", endTime: "16:00", isWorking: true },
      { dayOfWeek: 0, startTime: "10:00", endTime: "16:00", isWorking: false },
    ];

    await prisma.workingHour.createMany({
      data: workingHoursToCreate.map(wh => ({
        ...wh,
        barberId: barber.id,
      })),
    });

    revalidatePath("/admin/berberler");
    return {
      success: true,
      data: barber,
    };
  } catch (error) {
    console.error("Create barber error:", error);
    return {
      success: false,
      error: "Berber oluşturulurken hata oluştu",
    };
  }
}

export async function updateBarber(id: string, data: {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  experience?: number;
  specialties?: string;
  image?: string;
  slotDuration?: number;
  isActive?: boolean;
  workingHours?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorking: boolean;
  }>;
}) {
  try {
    if (data.email) {
      const existingBarber = await prisma.barber.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      });

      if (existingBarber) {
        return {
          success: false,
          error: "Bu email adresi zaten kullanılıyor",
        };
      }
    }

    const { workingHours, ...barberData } = data;

    const barber = await prisma.barber.update({
      where: { id },
      data: {
        ...barberData,
        ...(barberData.password && { password: barberData.password }),
      },
    });

    if (workingHours && workingHours.length > 0) {
      await prisma.workingHour.deleteMany({
        where: { barberId: id },
      });

      await prisma.workingHour.createMany({
        data: workingHours.map(wh => ({
          ...wh,
          barberId: id,
        })),
      });
    }

    revalidatePath("/admin/berberler");
    revalidatePath(`/admin/berberler/${id}`);
    return {
      success: true,
      data: barber,
    };
  } catch (error) {
    console.error("Update barber error:", error);
    return {
      success: false,
      error: "Berber güncellenirken hata oluştu",
    };
  }
}

// REMOVED: deleteBarber function - Feature disabled for data integrity

export async function toggleBarberStatus(id: string) {
  try {
    const barber = await prisma.barber.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!barber) {
      return {
        success: false,
        error: "Berber bulunamadı",
      };
    }

    const updatedBarber = await prisma.barber.update({
      where: { id },
      data: { isActive: !barber.isActive },
    });

    revalidatePath("/admin/berberler");
    return {
      success: true,
      data: updatedBarber,
    };
  } catch (error) {
    console.error("Toggle barber status error:", error);
    return {
      success: false,
      error: "Berber durumu güncellenirken hata oluştu",
    };
  }
}

export async function updateBarberWorkingHours(barberId: string, workingHours: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}[]) {
  try {
    // Mevcut çalışma saatlerini sil
    await prisma.workingHour.deleteMany({
      where: { barberId },
    });

    // Yeni çalışma saatlerini ekle
    await prisma.workingHour.createMany({
      data: workingHours.map(wh => ({
        ...wh,
        barberId,
      })),
    });

    revalidatePath(`/admin/berberler/${barberId}`);
    revalidatePath("/admin/ayarlar");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Update working hours error:", error);
    return {
      success: false,
      error: "Çalışma saatleri güncellenirken hata oluştu",
    };
  }
}
