import { PrismaClient } from '../src/generated/prisma'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // SiteSettings kaldırıldı

  // Admin Berber
  const hashedPassword = await bcrypt.hash('123456', 10)

  const adminBarber = await prisma.barber.create({
    data: {
      name: 'Ahmet Yılmaz',
      email: 'admin@themenshair.com',
      password: hashedPassword,
      role: 'admin',
      experience: 10,
      rating: 4.9,
      specialties: 'Klasik kesim, Modern stil, Sakal şekillendirme',
      isActive: true,
    }
  })

  // Çalışma Saatleri (Pazartesi-Cumartesi)
  for (let day = 1; day <= 6; day++) {
    await prisma.workingHour.create({
      data: {
        barberId: adminBarber.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '23:00',
        isWorking: true
      }
    })
  }

  // Pazar kapalı
  await prisma.workingHour.create({
    data: {
      barberId: adminBarber.id,
      dayOfWeek: 0,
      startTime: '00:00',
      endTime: '00:00',
      isWorking: false
    }
  })

  // Randevu Ayarları
  await prisma.appointmentSettings.create({
    data: {
      slotDuration: 30,
      slotDurationLabel: '30 Dakika',
      maxAdvanceDays: 30,
      isActive: true,
      serviceBasedDuration: true,
    }
  })

  // Hizmetler
  const services = await prisma.service.createMany({
    data: [
      { name: 'Saç Kesimi', description: 'Profesyonel saç kesimi', duration: 30, price: 150, category: 'Saç', sortOrder: 1, isActive: true },
      { name: 'Sakal Traşı', description: 'Hijyenik sakal traşı', duration: 20, price: 100, category: 'Sakal', sortOrder: 2, isActive: true },
      { name: 'Saç & Sakal', description: 'Saç ve sakal birlikte', duration: 50, price: 220, category: 'Kombinasyon', sortOrder: 3, isActive: true },
    ]
  })

  console.log('✅ Seed completed!')
  console.log('📧 Admin Email: admin@themenshair.com')
  console.log('🔑 Admin Password: 123456')
}

main()
    .catch((e) => {
      console.error('❌ Seed failed:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })