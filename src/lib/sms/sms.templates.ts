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

type SmsTemplateFunction<T = unknown> = (payload: T) => string

type SmsTemplateMap = {
  [SmsEvent.AppointmentCreated]: SmsTemplateFunction<AppointmentCreatedPayload>
  [SmsEvent.AppointmentApproved]: SmsTemplateFunction<AppointmentApprovedPayload>
  [SmsEvent.AppointmentCancelledPending]: SmsTemplateFunction<AppointmentCancelledPendingPayload>
  [SmsEvent.AppointmentCancelledApproved]: SmsTemplateFunction
  [SmsEvent.AppointmentReminder2h]: SmsTemplateFunction
  [SmsEvent.AppointmentReminder1h]: SmsTemplateFunction
}

const templates: Record<SmsEvent, Record<SmsRole, SmsTemplateFunction>> = {
  [SmsEvent.AppointmentCreated]: {
    customer: (payload: AppointmentCreatedPayload) =>
      `Merhaba ${payload.customerName}, randevu talebiniz alındı. Onay için bekliyoruz.`,
    admin: (payload: AppointmentCreatedPayload) =>
      `Yeni randevu talebi alındı. Müşteri: ${payload.customerName}, Tarih: ${payload.date}, Saat: ${payload.requestedStartTime}`,
  },
  [SmsEvent.AppointmentApproved]: {
    customer: (payload: AppointmentApprovedPayload) =>
      `Merhaba ${payload.customerName}, randevunuz ONAYLANDI.\nTarih: ${payload.date}\nSaat: ${payload.startTime} - ${payload.endTime}`,
    admin: () => '',
  },
  [SmsEvent.AppointmentCancelledPending]: {
    customer: (payload: AppointmentCancelledPendingPayload) => {
      const reason = payload.reason && payload.reason.trim() 
        ? payload.reason 
        : 'İşletme tarafından kapatılan saatler'
      return `📌 Randevunuz iptal edilmiştir\n📅 Tarih: ${payload.date}\n⏰ Saat: ${payload.time}\n❗ Neden: ${reason}`
    },
    admin: () => '',
  },
  [SmsEvent.AppointmentCancelledApproved]: {
    customer: () => '',
    admin: () => '',
  },
  [SmsEvent.AppointmentReminder2h]: {
    customer: () => '',
    admin: () => '',
  },
  [SmsEvent.AppointmentReminder1h]: {
    customer: () => '',
    admin: () => '',
  },
}

export function getSmsTemplate(
  event: SmsEvent,
  role: SmsRole
): SmsTemplateFunction {
  return templates[event][role]
}

