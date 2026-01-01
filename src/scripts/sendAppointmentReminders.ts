import { prisma } from '@/lib/prisma'
import { getNowTR, createAppointmentDateTimeTR } from '@/lib/time/appointmentDateTime'
import { sendSms } from '@/lib/sms/sms.service'
import { getAdminPhoneSetting } from '@/lib/settings/settings-helpers'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

const REMINDER_TYPES = {
  HOUR_2: 'APPOINTMENT_REMINDER_HOUR_2',
  HOUR_1: 'APPOINTMENT_REMINDER_HOUR_1',
} as const

type ReminderType = typeof REMINDER_TYPES[keyof typeof REMINDER_TYPES]

function formatDateTR(date: Date): string {
  return format(date, 'dd.MM.yyyy', { locale: tr })
}

function formatTimeTR(date: Date): string {
  return format(date, 'HH:mm', { locale: tr })
}

function createReminderMessage(
  reminderType: ReminderType,
  customerName: string,
  date: string,
  startTime: string
): string {
  if (reminderType === REMINDER_TYPES.HOUR_2) {
    return `Merhaba ${customerName},
${date} tarihinde ${startTime} saatindeki randevunuzu hatırlatmak isteriz.
Randevunuza 2 saat kaldı.`
  } else {
    return `Merhaba ${customerName},
${date} tarihinde ${startTime} saatindeki randevunuza 1 saat kaldı.
Hizmetin aksamaması için lütfen randevudan 10 dk önce geliniz.`
  }
}

function getReminderEvent(appointmentRequestId: string, reminderType: ReminderType): string {
  return `${reminderType}_${appointmentRequestId}`
}

async function checkIfReminderSent(appointmentRequestId: string, reminderType: ReminderType): Promise<boolean> {
  const event = getReminderEvent(appointmentRequestId, reminderType)
  const existingLog = await prisma.smsLog.findFirst({
    where: {
      event,
    },
  })
  return !!existingLog
}

async function sendReminderSms(
  appointmentRequestId: string,
  customerPhone: string,
  customerName: string,
  date: string,
  startTime: string,
  reminderType: ReminderType
): Promise<void> {
  const message = createReminderMessage(reminderType, customerName, date, startTime)
  
  try {
    await sendSms(customerPhone, message)
    
    const event = getReminderEvent(appointmentRequestId, reminderType)
    await prisma.smsLog.create({
      data: {
        to: customerPhone,
        message,
        event,
        provider: 'vatansms',
        status: 'success',
        error: null,
      },
    })
  } catch (error) {
    const event = getReminderEvent(appointmentRequestId, reminderType)
    await prisma.smsLog.create({
      data: {
        to: customerPhone,
        message,
        event,
        provider: 'vatansms',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      },
    })
    throw error
  }
}

function isWithinReminderWindow(
  appointmentDateTime: Date,
  now: Date,
  hoursBefore: number,
  toleranceMinutes: number = 5
): boolean {
  const targetTime = new Date(appointmentDateTime.getTime() - hoursBefore * 60 * 60 * 1000)
  const diffMs = Math.abs(now.getTime() - targetTime.getTime())
  const diffMinutes = diffMs / (1000 * 60)
  return diffMinutes <= toleranceMinutes
}

async function main() {
  console.log('[Appointment Reminders] Script başlatılıyor...')
  
  const now = getNowTR()
  console.log(`[Appointment Reminders] Şu anki zaman (TR): ${format(now, 'dd.MM.yyyy HH:mm:ss')}`)
  
  const adminPhone = await getAdminPhoneSetting()
  console.log(`[Appointment Reminders] Admin telefon: ${adminPhone || 'ayarlanmamış'}`)
  
  const approvedAppointments = await prisma.appointmentRequest.findMany({
    where: {
      status: 'approved',
    },
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      date: true,
      requestedStartTime: true,
    },
  })
  
  console.log(`[Appointment Reminders] Toplam ${approvedAppointments.length} onaylanmış randevu bulundu`)
  
  let reminders2hSent = 0
  let reminders1hSent = 0
  let reminders2hSkipped = 0
  let reminders1hSkipped = 0
  let errors = 0
  
  for (const appointment of approvedAppointments) {
    if (!appointment.requestedStartTime) {
      continue
    }
    
    if (adminPhone && appointment.customerPhone === adminPhone) {
      console.log(`[Appointment Reminders] Admin randevusu atlandı: ${appointment.id}`)
      continue
    }
    
    try {
      const appointmentDateTime = createAppointmentDateTimeTR(appointment.date, appointment.requestedStartTime)
      
      if (appointmentDateTime.getTime() <= now.getTime()) {
        continue
      }
      
      const formattedDate = formatDateTR(appointmentDateTime)
      const formattedTime = formatTimeTR(appointmentDateTime)
      
      if (isWithinReminderWindow(appointmentDateTime, now, 2, 5)) {
        const alreadySent = await checkIfReminderSent(appointment.id, REMINDER_TYPES.HOUR_2)
        
        if (alreadySent) {
          reminders2hSkipped++
          console.log(`[Appointment Reminders] 2 saat hatırlatması zaten gönderilmiş: ${appointment.id}`)
        } else {
          await sendReminderSms(
            appointment.id,
            appointment.customerPhone,
            appointment.customerName,
            formattedDate,
            formattedTime,
            REMINDER_TYPES.HOUR_2
          )
          reminders2hSent++
          console.log(`[Appointment Reminders] 2 saat hatırlatması gönderildi: ${appointment.id} - ${appointment.customerPhone}`)
        }
      }
      
      if (isWithinReminderWindow(appointmentDateTime, now, 1, 5)) {
        const alreadySent = await checkIfReminderSent(appointment.id, REMINDER_TYPES.HOUR_1)
        
        if (alreadySent) {
          reminders1hSkipped++
          console.log(`[Appointment Reminders] 1 saat hatırlatması zaten gönderilmiş: ${appointment.id}`)
        } else {
          await sendReminderSms(
            appointment.id,
            appointment.customerPhone,
            appointment.customerName,
            formattedDate,
            formattedTime,
            REMINDER_TYPES.HOUR_1
          )
          reminders1hSent++
          console.log(`[Appointment Reminders] 1 saat hatırlatması gönderildi: ${appointment.id} - ${appointment.customerPhone}`)
        }
      }
    } catch (error) {
      errors++
      console.error(`[Appointment Reminders] Hata (${appointment.id}):`, error)
    }
  }
  
  console.log('\n[Appointment Reminders] Özet:')
  console.log(`  - 2 saat hatırlatması gönderildi: ${reminders2hSent}`)
  console.log(`  - 2 saat hatırlatması atlandı (duplicate): ${reminders2hSkipped}`)
  console.log(`  - 1 saat hatırlatması gönderildi: ${reminders1hSent}`)
  console.log(`  - 1 saat hatırlatması atlandı (duplicate): ${reminders1hSkipped}`)
  console.log(`  - Hata sayısı: ${errors}`)
  console.log(`  - Toplam SMS gönderildi: ${reminders2hSent + reminders1hSent}`)
  
  try {
    await prisma.systemJobLog.create({
      data: {
        jobName: 'appointment_reminders',
        meta: {
          totalApproved: approvedAppointments.length,
          reminders2hSent,
          reminders1hSent,
          reminders2hSkipped,
          reminders1hSkipped,
          errors,
        },
      },
    })
    console.log('[Appointment Reminders] Job log kaydedildi')
  } catch (logError) {
    console.error('[Appointment Reminders] Job log kaydedilemedi:', logError)
  }
  
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[Appointment Reminders] Kritik hata:', error)
  process.exit(1)
})

