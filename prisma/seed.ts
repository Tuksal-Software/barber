import { PrismaClient } from '../src/generated/prisma'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Site Ayarları
  await prisma.siteSettings.create({
    data: {
      salonName: 'The Mens Hair',
      description: 'Profesyonel Erkek Kuaförlük Hizmetleri',
      address: 'Örnek Mahalle, Cadde No:123, İstanbul',
      phone: '0555 123 4567',
      email: 'info@themenshair.com',
      workingHours: 'Pazartesi-Cumartesi: 09:00-19:00',
      socialMedia: JSON.stringify({
        instagram: 'https://instagram.com/themenshair',
        facebook: 'https://facebook.com/themenshair'
      })
    }
  })

  // Admin Berber
  const hashedPassword = await bcrypt.hash('sirinburak1712', 10)

  const adminBarber = await prisma.barber.create({
    data: {
      name: 'Ahmet Yılmaz',
      email: 'buraksirin@themenshair.com',
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
      isActive: true
    }
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