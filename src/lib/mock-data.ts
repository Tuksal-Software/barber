import { Service, Barber, GalleryImage, SiteSettings } from '@/types'

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Saç Kesimi',
    description: 'Profesyonel saç kesimi ve şekillendirme',
    duration: 30,
    price: 80,
    category: 'Saç',
    image: '/images/services/haircut.jpg'
  },
  {
    id: '2',
    name: 'Sakal Traşı',
    description: 'Hijyenik sakal traşı ve şekillendirme',
    duration: 20,
    price: 50,
    category: 'Sakal',
    image: '/images/services/beard-trim.jpg'
  },
  {
    id: '3',
    name: 'Saç & Sakal',
    description: 'Saç kesimi ve sakal traşı birlikte',
    duration: 45,
    price: 120,
    category: 'Kombinasyon',
    image: '/images/services/hair-beard.jpg'
  },
  {
    id: '4',
    name: 'Çocuk Saç Kesimi',
    description: 'Çocuklar için özel saç kesimi',
    duration: 25,
    price: 60,
    category: 'Çocuk',
    image: '/images/services/kids-haircut.jpg'
  },
  {
    id: '5',
    name: 'Saç Boyama',
    description: 'Profesyonel saç boyama ve renklendirme',
    duration: 90,
    price: 200,
    category: 'Saç',
    image: '/images/services/hair-color.jpg'
  }
]

export const mockBarbers: Barber[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    experience: 8,
    rating: 4.8,
    specialties: 'Saç Kesimi, Sakal Traşı, Saç Boyama',
    image: '/images/barbers/ahmet.jpg',
    workingHours: {
      monday: { start: '09:00', end: '18:00', isWorking: true },
      tuesday: { start: '09:00', end: '18:00', isWorking: true },
      wednesday: { start: '09:00', end: '18:00', isWorking: true },
      thursday: { start: '09:00', end: '18:00', isWorking: true },
      friday: { start: '09:00', end: '18:00', isWorking: true },
      saturday: { start: '09:00', end: '16:00', isWorking: true },
      sunday: { start: '09:00', end: '16:00', isWorking: false }
    },
    services: ['1', '2', '3', '5']
  },
  {
    id: '2',
    name: 'Mehmet Demir',
    experience: 5,
    rating: 4.6,
    specialties: 'Saç Kesimi, Sakal Traşı',
    image: '/images/barbers/mehmet.jpg',
    workingHours: {
      monday: { start: '10:00', end: '19:00', isWorking: true },
      tuesday: { start: '10:00', end: '19:00', isWorking: true },
      wednesday: { start: '10:00', end: '19:00', isWorking: true },
      thursday: { start: '10:00', end: '19:00', isWorking: true },
      friday: { start: '10:00', end: '19:00', isWorking: true },
      saturday: { start: '10:00', end: '17:00', isWorking: true },
      sunday: { start: '10:00', end: '17:00', isWorking: false }
    },
    services: ['1', '2', '3']
  },
  {
    id: '3',
    name: 'Ali Kaya',
    experience: 12,
    rating: 4.9,
    specialties: 'Saç Kesimi, Sakal Traşı, Çocuk Saç Kesimi',
    image: '/images/barbers/ali.jpg',
    workingHours: {
      monday: { start: '08:00', end: '17:00', isWorking: true },
      tuesday: { start: '08:00', end: '17:00', isWorking: true },
      wednesday: { start: '08:00', end: '17:00', isWorking: true },
      thursday: { start: '08:00', end: '17:00', isWorking: true },
      friday: { start: '08:00', end: '17:00', isWorking: true },
      saturday: { start: '08:00', end: '15:00', isWorking: true },
      sunday: { start: '08:00', end: '15:00', isWorking: false }
    },
    services: ['1', '2', '3', '4']
  }
]

export const mockGalleryImages: GalleryImage[] = [
  {
    id: '1',
    url: '/images/gallery/salon-1.jpg',
    alt: 'Salon iç mekan',
    category: 'Salon',
    title: 'Modern Salon Tasarımı',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    url: '/images/gallery/work-1.jpg',
    alt: 'Saç kesimi çalışması',
    category: 'Çalışmalar',
    title: 'Profesyonel Saç Kesimi',
    createdAt: new Date('2024-01-02')
  },
  {
    id: '3',
    url: '/images/gallery/work-2.jpg',
    alt: 'Sakal traşı çalışması',
    category: 'Çalışmalar',
    title: 'Hijyenik Sakal Traşı',
    createdAt: new Date('2024-01-03')
  },
  {
    id: '4',
    url: '/images/gallery/salon-2.jpg',
    alt: 'Salon dış mekan',
    category: 'Salon',
    title: 'Salon Girişi',
    createdAt: new Date('2024-01-04')
  }
]

export const mockSiteSettings: SiteSettings = {
  salonName: 'The Mens Hair',
  description: 'Profesyonel erkek kuaförlük hizmetleri ile modern ve hijyenik ortamda kaliteli hizmet sunuyoruz.',
  address: 'Atatürk Caddesi No:123, Merkez/İstanbul',
  phone: '+90 (212) 555 0123',
  email: 'info@themenshair.com',
  workingHours: {
    monday: { start: '09:00', end: '19:00', isWorking: true },
    tuesday: { start: '09:00', end: '19:00', isWorking: true },
    wednesday: { start: '09:00', end: '19:00', isWorking: true },
    thursday: { start: '09:00', end: '19:00', isWorking: true },
    friday: { start: '09:00', end: '19:00', isWorking: true },
    saturday: { start: '09:00', end: '17:00', isWorking: true },
    sunday: { start: '09:00', end: '17:00', isWorking: false }
  },
  socialMedia: {
    instagram: 'https://instagram.com/themenshair',
    facebook: 'https://facebook.com/themenshair',
    twitter: 'https://twitter.com/themenshair'
  }
}

