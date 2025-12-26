import { SmsEvent } from './sms.events'

export type SmsRole = 'customer' | 'admin'

export interface AppointmentCreatedPayload {
  customerName: string
  customerPhone: string
  barberId: string
  date: string
  requestedStartTime: string
}

export interface AppointmentApprovedPayload {
  customerName: string
  customerPhone: string
  date: string
  startTime: string
  endTime: string
}

export interface AppointmentCancelledPendingPayload {
  customerName: string
  customerPhone: string
  date: string
  time: string
  reason?: string | null
}

export interface SubscriptionCreatedPayload {
  customerName: string
  customerPhone: string
  recurrenceType: string
  dayOfWeek: number
  weekOfMonth?: number | null
  startTime: string
  startDate: string
}

export interface SubscriptionCancelledPayload {
  customerName: string
  customerPhone: string
}

type SmsPayloadMap = {
  [SmsEvent.AppointmentCreated]: AppointmentCreatedPayload
  [SmsEvent.AppointmentApproved]: AppointmentApprovedPayload
  [SmsEvent.AppointmentCancelledPending]: AppointmentCancelledPendingPayload
  [SmsEvent.AppointmentCancelledApproved]: Record<string, never>
  [SmsEvent.AppointmentReminder2h]: Record<string, never>
  [SmsEvent.AppointmentReminder1h]: Record<string, never>
  [SmsEvent.SubscriptionCreated]: SubscriptionCreatedPayload
  [SmsEvent.SubscriptionCancelled]: SubscriptionCancelledPayload
}

type SmsTemplateMap = {
  [K in SmsEvent]: {
    [R in SmsRole]: (payload: SmsPayloadMap[K]) => string
  }
}

const templates: SmsTemplateMap = {
  [SmsEvent.AppointmentCreated]: {
    customer: (payload: AppointmentCreatedPayload) =>
      `Merhaba ${payload.customerName}, randevu talebiniz alındı. Onay için bekliyoruz.`,
    admin: (payload: AppointmentCreatedPayload) =>
      `Yeni randevu talebi alındı. Müşteri: ${payload.customerName}, Tarih: ${payload.date}, Saat: ${payload.requestedStartTime}`,
  },
  [SmsEvent.AppointmentApproved]: {
    customer: (payload: AppointmentApprovedPayload) =>
      `Merhaba ${payload.customerName}, randevunuz ONAYLANDI.\nTarih: ${payload.date}\nSaat: ${payload.startTime} - ${payload.endTime}`,
    admin: (_payload: AppointmentApprovedPayload) => '',
  },
  [SmsEvent.AppointmentCancelledPending]: {
    customer: (payload: AppointmentCancelledPendingPayload) => {
      const reason = payload.reason && payload.reason.trim() 
        ? payload.reason 
        : 'İşletme tarafından kapatılan saatler'
      return `📌 Randevunuz iptal edilmiştir\n📅 Tarih: ${payload.date}\n⏰ Saat: ${payload.time}\n❗ Neden: ${reason}`
    },
    admin: (_payload: AppointmentCancelledPendingPayload) => '',
  },
  [SmsEvent.AppointmentCancelledApproved]: {
    customer: (_payload: Record<string, never>) => '',
    admin: (_payload: Record<string, never>) => '',
  },
  [SmsEvent.AppointmentReminder2h]: {
    customer: (_payload: Record<string, never>) => '',
    admin: (_payload: Record<string, never>) => '',
  },
  [SmsEvent.AppointmentReminder1h]: {
    customer: (_payload: Record<string, never>) => '',
    admin: (_payload: Record<string, never>) => '',
  },
  [SmsEvent.SubscriptionCreated]: {
    customer: (payload: SubscriptionCreatedPayload) => {
      const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
      const dayName = dayNames[payload.dayOfWeek === 0 ? 0 : payload.dayOfWeek]
      
      let recurrenceText = ''
      if (payload.recurrenceType === 'weekly') {
        recurrenceText = `Her ${dayName} günü`
      } else if (payload.recurrenceType === 'biweekly') {
        recurrenceText = `2 haftada bir ${dayName} günü`
      } else {
        const weekText = payload.weekOfMonth === 1 ? '1.' : payload.weekOfMonth === 2 ? '2.' : payload.weekOfMonth === 3 ? '3.' : payload.weekOfMonth === 4 ? '4.' : '5.'
        recurrenceText = `Her ayın ${weekText} ${dayName} günü`
      }
      
      return `Merhaba ${payload.customerName}, abonman randevularınız oluşturuldu.\n${recurrenceText} saat ${payload.startTime}`
    },
    admin: (_payload: SubscriptionCreatedPayload) => '',
  },
  [SmsEvent.SubscriptionCancelled]: {
    customer: (payload: SubscriptionCancelledPayload) =>
      `Merhaba ${payload.customerName}, abonman randevularınız iptal edilmiştir.`,
    admin: (_payload: SubscriptionCancelledPayload) => '',
  },
}

export function getSmsTemplate<K extends SmsEvent>(
  event: K,
  role: SmsRole
): (payload: SmsPayloadMap[K]) => string {
  return templates[event][role]
}

