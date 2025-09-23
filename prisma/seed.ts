import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Site Settings
  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: 'site-settings-1' },
    update: {},
    create: {
      id: 'site-settings-1',
      salonName: 'Elite Berber Salonu',
      description: 'Modern ve hijyenik ortamda profesyonel berber hizmetleri',
      address: 'Atatürk Caddesi No:123, Merkez/İstanbul',
      phone: '+90 212 555 0123',
      email: 'info@eliteberber.com',
      workingHours: JSON.stringify({
        monday: { start: '09:00', end: '19:00', isWorking: true },
        tuesday: { start: '09:00', end: '19:00', isWorking: true },
        wednesday: { start: '09:00', end: '19:00', isWorking: true },
        thursday: { start: '09:00', end: '19:00', isWorking: true },
        friday: { start: '09:00', end: '19:00', isWorking: true },
        saturday: { start: '09:00', end: '17:00', isWorking: true },
        sunday: { start: '10:00', end: '18:00', isWorking: true }
      }),
      socialMedia: JSON.stringify({
        instagram: 'https://instagram.com/eliteberber',
        facebook: 'https://facebook.com/eliteberber',
        twitter: 'https://twitter.com/eliteberber'
      })
    }
  })

  // Services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'service-1' },
      update: {},
      create: {
        id: 'service-1',
        name: 'Saç Kesimi',
        description: 'Profesyonel saç kesimi ve şekillendirme',
        duration: 30,
        price: 80.0,
        category: 'Saç Hizmetleri',

      }
    }),
    prisma.service.upsert({
      where: { id: 'service-2' },
      update: {},
      create: {
        id: 'service-2',
        name: 'Sakal Traşı',
        description: 'Hijyenik sakal traşı ve şekillendirme',
        duration: 20,
        price: 50.0,
        category: 'Sakal Hizmetleri',

      }
    }),
    prisma.service.upsert({
      where: { id: 'service-3' },
      update: {},
      create: {
        id: 'service-3',
        name: 'Saç Boyama',
        description: 'Profesyonel saç boyama ve renklendirme',
        duration: 90,
        price: 150.0,
        category: 'Saç Hizmetleri',

      }
    }),
    prisma.service.upsert({
      where: { id: 'service-4' },
      update: {},
      create: {
        id: 'service-4',
        name: 'Saç Yıkama',
        description: 'Profesyonel saç yıkama ve bakım',
        duration: 15,
        price: 30.0,
        category: 'Saç Hizmetleri',

      }
    }),
    prisma.service.upsert({
      where: { id: 'service-5' },
      update: {},
      create: {
        id: 'service-5',
        name: 'Masaj',
        description: 'Rahatlatıcı kafa ve boyun masajı',
        duration: 20,
        price: 60.0,
        category: 'Ek Hizmetler',

      }
    })
  ])

  // Barbers
  const barbers = await Promise.all([
    prisma.barber.upsert({
      where: { id: 'barber-1' },
      update: {},
      create: {
        id: 'barber-1',
        name: 'Mehmet Usta',
        experience: 8,
        rating: 4.8,
        specialties: JSON.stringify(['Saç Kesimi', 'Sakal Traşı', 'Saç Boyama']),
        image: '/barbers/mehmet.jpg',

      }
    }),
    prisma.barber.upsert({
      where: { id: 'barber-2' },
      update: {},
      create: {
        id: 'barber-2',
        name: 'Ali Usta',
        experience: 12,
        rating: 4.9,
        specialties: JSON.stringify(['Saç Kesimi', 'Sakal Traşı', 'Masaj']),
        image: '/barbers/ali.jpg',

      }
    }),
    prisma.barber.upsert({
      where: { id: 'barber-3' },
      update: {},
      create: {
        id: 'barber-3',
        name: 'Can Usta',
        experience: 6,
        rating: 4.7,
        specialties: JSON.stringify(['Saç Kesimi', 'Saç Boyama', 'Saç Yıkama']),
        image: '/barbers/can.jpg',

      }
    })
  ])

  // Barber Services
  await Promise.all([
    prisma.barberService.upsert({
      where: { id: 'bs-1' },
      update: {},
      create: {
        id: 'bs-1',
        barberId: 'barber-1',
        serviceId: 'service-1'
      }
    }),
    prisma.barberService.upsert({
      where: { id: 'bs-2' },
      update: {},
      create: {
        id: 'bs-2',
        barberId: 'barber-1',
        serviceId: 'service-2'
      }
    }),
    prisma.barberService.upsert({
      where: { id: 'bs-3' },
      update: {},
      create: {
        id: 'bs-3',
        barberId: 'barber-1',
        serviceId: 'service-3'
      }
    }),
    prisma.barberService.upsert({
      where: { id: 'bs-4' },
      update: {},
      create: {
        id: 'bs-4',
        barberId: 'barber-2',
        serviceId: 'service-1'
      }
    }),
    prisma.barberService.upsert({
      where: { id: 'bs-5' },
      update: {},
      create: {
        id: 'bs-5',
        barberId: 'barber-2',
        serviceId: 'service-2'
      }
    }),
    prisma.barberService.upsert({
      where: { id: 'bs-6' },
      update: {},
      create: {
        id: 'bs-6',
        barberId: 'barber-2',
        serviceId: 'service-5'
      }
    }),
    prisma.barberService.upsert({
      where: { id: 'bs-7' },
      update: {},
      create: {
        id: 'bs-7',
        barberId: 'barber-3',
        serviceId: 'service-1'
      }
    }),
    prisma.barberService.upsert({
      where: { id: 'bs-8' },
      update: {},
      create: {
        id: 'bs-8',
        barberId: 'barber-3',
        serviceId: 'service-3'
      }
    }),
    prisma.barberService.upsert({
      where: { id: 'bs-9' },
      update: {},
      create: {
        id: 'bs-9',
        barberId: 'barber-3',
        serviceId: 'service-4'
      }
    })
  ])

  // Working Hours - Tüm berberler için tüm günler
  await Promise.all([
    // Berber 1 - Mehmet Usta
    prisma.workingHour.upsert({
      where: { id: 'wh-1' },
      update: {},
      create: {
        id: 'wh-1',
        barberId: 'barber-1',
            dayOfWeek: "monday", // Pazar
        startTime: '10:00',
        endTime: '18:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-2' },
      update: {},
      create: {
        id: 'wh-2',
        barberId: 'barber-1',
            dayOfWeek: "tuesday", // Pazartesi
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-3' },
      update: {},
      create: {
        id: 'wh-3',
        barberId: 'barber-1',
            dayOfWeek: "wednesday", // Salı
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-4' },
      update: {},
      create: {
        id: 'wh-4',
        barberId: 'barber-1',
            dayOfWeek: "thursday", // Çarşamba
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-5' },
      update: {},
      create: {
        id: 'wh-5',
        barberId: 'barber-1',
            dayOfWeek: "friday", // Perşembe
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-6' },
      update: {},
      create: {
        id: 'wh-6',
        barberId: 'barber-1',
            dayOfWeek: "saturday", // Cuma
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-7' },
      update: {},
      create: {
        id: 'wh-7',
        barberId: 'barber-1',
            dayOfWeek: "sunday", // Cumartesi
        startTime: '09:00',
        endTime: '17:00',
        isWorking: true
      }
    }),

    // Berber 2 - Ali Usta
    prisma.workingHour.upsert({
      where: { id: 'wh-8' },
      update: {},
      create: {
        id: 'wh-8',
        barberId: 'barber-2',
            dayOfWeek: "monday", // Pazar
        startTime: '10:00',
        endTime: '18:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-9' },
      update: {},
      create: {
        id: 'wh-9',
        barberId: 'barber-2',
            dayOfWeek: "tuesday", // Pazartesi
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-10' },
      update: {},
      create: {
        id: 'wh-10',
        barberId: 'barber-2',
            dayOfWeek: "wednesday", // Salı
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-11' },
      update: {},
      create: {
        id: 'wh-11',
        barberId: 'barber-2',
            dayOfWeek: "thursday", // Çarşamba
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-12' },
      update: {},
      create: {
        id: 'wh-12',
        barberId: 'barber-2',
            dayOfWeek: "friday", // Perşembe
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-13' },
      update: {},
      create: {
        id: 'wh-13',
        barberId: 'barber-2',
            dayOfWeek: "saturday", // Cuma
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-14' },
      update: {},
      create: {
        id: 'wh-14',
        barberId: 'barber-2',
            dayOfWeek: "sunday", // Cumartesi
        startTime: '09:00',
        endTime: '17:00',
        isWorking: true
      }
    }),

    // Berber 3 - Can Usta
    prisma.workingHour.upsert({
      where: { id: 'wh-15' },
      update: {},
      create: {
        id: 'wh-15',
        barberId: 'barber-3',
            dayOfWeek: "monday", // Pazar
        startTime: '10:00',
        endTime: '18:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-16' },
      update: {},
      create: {
        id: 'wh-16',
        barberId: 'barber-3',
            dayOfWeek: "tuesday", // Pazartesi
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-17' },
      update: {},
      create: {
        id: 'wh-17',
        barberId: 'barber-3',
            dayOfWeek: "wednesday", // Salı
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-18' },
      update: {},
      create: {
        id: 'wh-18',
        barberId: 'barber-3',
            dayOfWeek: "thursday", // Çarşamba
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-19' },
      update: {},
      create: {
        id: 'wh-19',
        barberId: 'barber-3',
            dayOfWeek: "friday", // Perşembe
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-20' },
      update: {},
      create: {
        id: 'wh-20',
        barberId: 'barber-3',
            dayOfWeek: "saturday", // Cuma
        startTime: '09:00',
        endTime: '19:00',
        isWorking: true
      }
    }),
    prisma.workingHour.upsert({
      where: { id: 'wh-21' },
      update: {},
      create: {
        id: 'wh-21',
        barberId: 'barber-3',
            dayOfWeek: "sunday", // Cumartesi
        startTime: '09:00',
        endTime: '17:00',
        isWorking: true
      }
    })
  ])

  // Gallery Images
  await Promise.all([
    prisma.galleryImage.upsert({
      where: { id: 'gallery-1' },
      update: {},
      create: {
        id: 'gallery-1',
        url: '/gallery/salon-1.jpg',
        alt: 'Salon iç mekan',
        category: 'Salon',
        title: 'Modern Salon Tasarımı',

      }
    }),
    prisma.galleryImage.upsert({
      where: { id: 'gallery-2' },
      update: {},
      create: {
        id: 'gallery-2',
        url: '/gallery/work-1.jpg',
        alt: 'Saç kesimi çalışması',
        category: 'Çalışma',
        title: 'Profesyonel Saç Kesimi',

      }
    }),
    prisma.galleryImage.upsert({
      where: { id: 'gallery-3' },
      update: {},
      create: {
        id: 'gallery-3',
        url: '/gallery/work-2.jpg',
        alt: 'Sakal traşı çalışması',
        category: 'Çalışma',
        title: 'Hijyenik Sakal Traşı',

      }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created: ${services.length} services, ${barbers.length} barbers`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
