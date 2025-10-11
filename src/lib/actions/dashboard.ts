"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentDate, getStartOfWeek, getEndOfWeek } from "@/lib/utils";

export async function getDashboardStats() {
  try {
    const today = getCurrentDate();
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();

    // Bugünkü randevular
    const todayAppointments = await prisma.appointment.count({
      where: {
        date: today,
      },
    });

    // Bu haftaki toplam randevular
    const weekAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
    });

    // Bekleyen randevular
    const pendingAppointments = await prisma.appointment.count({
      where: {
        status: "pending",
      },
    });

    // Aktif berberler
    const activeBarbers = await prisma.barber.count({
      where: {
        isActive: true,
      },
    });

    // Dünden bugüne artış
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayAppointments = await prisma.appointment.count({
      where: {
        date: yesterday,
      },
    });

    const todayVsYesterday = todayAppointments - yesterdayAppointments;

    // Geçen hafta ile karşılaştırma
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(endOfWeek);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    const lastWeekAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: lastWeekStart,
          lte: lastWeekEnd,
        },
      },
    });

    const weekGrowth = lastWeekAppointments > 0 
      ? Math.round(((weekAppointments - lastWeekAppointments) / lastWeekAppointments) * 100)
      : 0;

    return {
      success: true,
      data: {
        todayAppointments,
        weekAppointments,
        pendingAppointments,
        activeBarbers,
        todayVsYesterday,
        weekGrowth,
      },
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      success: false,
      error: "İstatistikler yüklenirken hata oluştu",
    };
  }
}

export async function getBarberPerformance() {
  try {
    const today = getCurrentDate();
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();

    const barbers = await prisma.barber.findMany({
      where: {
        isActive: true,
      },
      include: {
        appointments: {
          where: {
            date: {
              gte: startOfWeek,
              lte: endOfWeek,
            },
          },
        },
        workingHours: true,
      },
    });

    const performance = await Promise.all(
      barbers.map(async (barber) => {
        // Bugünkü randevular
        const todayAppointments = await prisma.appointment.count({
          where: {
            barberId: barber.id,
            date: today,
          },
        });

        // Bu haftaki toplam randevular
        const weekAppointments = barber.appointments.length;

        // Doluluk oranı hesaplama (basit)
        const totalSlots = 40; // Haftalık tahmini slot sayısı
        const occupancyRate = Math.round((weekAppointments / totalSlots) * 100);

        // Yaklaşan randevular
        const upcomingAppointments = await prisma.appointment.findMany({
          where: {
            barberId: barber.id,
            date: today,
            startTime: {
              gte: new Date().toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          take: 3,
        });

        return {
          id: barber.id,
          name: barber.name,
          image: barber.image,
          experience: barber.experience,
          rating: Number(barber.rating),
          todayAppointments,
          weekAppointments,
          occupancyRate,
          upcomingAppointments: upcomingAppointments.map(apt => ({
            time: apt.startTime,
            customer: apt.customerName,
          })),
        };
      })
    );

    return {
      success: true,
      data: performance,
    };
  } catch (error) {
    console.error("Barber performance error:", error);
    return {
      success: false,
      error: "Berber performansı yüklenirken hata oluştu",
    };
  }
}

export async function getRecentAppointments() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        barber: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return {
      success: true,
      data: appointments,
    };
  } catch (error) {
    console.error("Recent appointments error:", error);
    return {
      success: false,
      error: "Son randevular yüklenirken hata oluştu",
    };
  }
}
