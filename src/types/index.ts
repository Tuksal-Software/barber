export interface Service {
  id: string
  name: string
  description: string
  duration: number // dakika cinsinden
  price: number
  category: string
  image?: string
}

export interface Barber {
  id: string
  name: string
  experience: number // yıl cinsinden
  rating: number
  specialties: string[]
  image: string
  workingHours: WorkingHours
  services: string[] // service ID'leri
}

export interface WorkingHours {
  monday: TimeRange
  tuesday: TimeRange
  wednesday: TimeRange
  thursday: TimeRange
  friday: TimeRange
  saturday: TimeRange
  sunday: TimeRange
}

export interface TimeRange {
  start: string // "09:00" formatında
  end: string // "18:00" formatında
  isWorking: boolean
}

export interface Appointment {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  serviceId: string
  barberId: string
  date: Date
  timeSlot: string // "09:00-10:00" formatında
  status: AppointmentStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface TimeSlot {
  start: string
  end: string
  isAvailable: boolean
  appointmentId?: string
}

export interface GalleryImage {
  id: string
  url: string
  alt: string
  category: string
  title?: string
  createdAt: Date
}

export interface ContactForm {
  name: string
  email: string
  phone: string
  message: string
}

export interface SiteSettings {
  salonName: string
  description: string
  address: string
  phone: string
  email: string
  workingHours: WorkingHours
  socialMedia: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
}

