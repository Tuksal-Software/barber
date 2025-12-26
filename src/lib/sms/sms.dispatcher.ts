import { SmsEvent } from './sms.events'
import { getSmsTemplate, type SmsRole, type AppointmentCreatedPayload, type AppointmentApprovedPayload, type AppointmentCancelledPendingPayload, type SubscriptionCreatedPayload, type SubscriptionCancelledPayload } from './sms.templates'
import { sendSms } from './sms.service'
import { env } from '@/lib/config/env'
import { prisma } from '@/lib/prisma'
import { auditLog } from '@/lib/audit/audit.logger'
import { getAdminPhoneSetting, getSmsSenderSetting } from '@/lib/settings/settings-helpers'

type SmsPayload = AppointmentCreatedPayload | AppointmentApprovedPayload | AppointmentCancelledPendingPayload | SubscriptionCreatedPayload | SubscriptionCancelledPayload

async function logSms(to: string, message: string, event: SmsEvent, status: 'success' | 'error', error?: string): Promise<void> {
  try {
    await prisma.smsLog.create({
      data: {
        to,
        message,
        event,
        provider: 'vatansms',
        status,
        error: error || null,
      },
    })

    try {
      const adminPhone = await getAdminPhoneSetting()
      const smsSender = await getSmsSenderSetting()
      const isAdmin = adminPhone ? to === adminPhone : false
      await auditLog({
        actorType: 'system',
        action: status === 'success' ? 'SMS_SENT' : 'SMS_FAILED',
        entityType: 'sms',
        entityId: null,
        summary: status === 'success' ? 'SMS sent' : 'SMS failed',
        metadata: {
          to,
          event,
          error: error || null,
          provider: 'vatanSMS',
          sender: smsSender,
          messageLength: message.length,
          isAdmin,
        },
      })
    } catch {
    }
  } catch (logError) {
    console.error('[SMS Log] Failed to log SMS:', logError)
  }
}

export async function dispatchSms(
  event: SmsEvent,
  payload: SmsPayload
): Promise<void> {
  try {
    if (event === SmsEvent.AppointmentCreated) {
      const customerTemplate = getSmsTemplate(event, 'customer')
      const adminTemplate = getSmsTemplate(event, 'admin')

      const customerMessage = customerTemplate(payload as AppointmentCreatedPayload)
      const adminMessage = adminTemplate(payload as AppointmentCreatedPayload)

      const promises: Promise<void>[] = []

      if (payload.customerPhone && payload.customerPhone.trim()) {
        promises.push(
          sendSms(payload.customerPhone, customerMessage)
            .then(() => logSms(payload.customerPhone, customerMessage, event, 'success'))
            .catch((error) => logSms(payload.customerPhone, customerMessage, event, 'error', error instanceof Error ? error.message : String(error)))
        )
      } else {
        console.warn('[SMS Dispatcher] Customer phone is empty, skipping SMS')
      }

      const adminPhone = await getAdminPhoneSetting()
      if (adminPhone && adminPhone.trim()) {
        promises.push(
          sendSms(adminPhone, adminMessage)
            .then(() => logSms(adminPhone, adminMessage, event, 'success'))
            .catch((error) => logSms(adminPhone, adminMessage, event, 'error', error instanceof Error ? error.message : String(error)))
        )
      } else {
        console.warn('[SMS Dispatcher] Admin phone is not set, skipping admin SMS')
      }

      await Promise.allSettled(promises)
    } else if (event === SmsEvent.AppointmentApproved) {
      const customerTemplate = getSmsTemplate(event, 'customer')
      const customerMessage = customerTemplate(payload as AppointmentApprovedPayload)

      if (payload.customerPhone && payload.customerPhone.trim()) {
        try {
          await sendSms(payload.customerPhone, customerMessage)
          await logSms(payload.customerPhone, customerMessage, event, 'success')
        } catch (error) {
          await logSms(payload.customerPhone, customerMessage, event, 'error', error instanceof Error ? error.message : String(error))
        }
      } else {
        console.warn('[SMS Dispatcher] Customer phone is empty, skipping SMS')
      }
    } else if (event === SmsEvent.AppointmentCancelledPending) {
      const customerTemplate = getSmsTemplate(event, 'customer')
      const customerMessage = customerTemplate(payload as AppointmentCancelledPendingPayload)

      if (payload.customerPhone && payload.customerPhone.trim()) {
        try {
          await sendSms(payload.customerPhone, customerMessage)
          await logSms(payload.customerPhone, customerMessage, event, 'success')
        } catch (error) {
          await logSms(payload.customerPhone, customerMessage, event, 'error', error instanceof Error ? error.message : String(error))
        }
      } else {
        console.warn('[SMS Dispatcher] Customer phone is empty, skipping SMS')
      }
    } else if (event === SmsEvent.SubscriptionCreated) {
      const customerTemplate = getSmsTemplate(event, 'customer')
      const customerMessage = customerTemplate(payload as SubscriptionCreatedPayload)

      if (payload.customerPhone && payload.customerPhone.trim()) {
        try {
          await sendSms(payload.customerPhone, customerMessage)
          await logSms(payload.customerPhone, customerMessage, event, 'success')
        } catch (error) {
          await logSms(payload.customerPhone, customerMessage, event, 'error', error instanceof Error ? error.message : String(error))
        }
      } else {
        console.warn('[SMS Dispatcher] Customer phone is empty, skipping SMS')
      }
    } else if (event === SmsEvent.SubscriptionCancelled) {
      const customerTemplate = getSmsTemplate(event, 'customer')
      const customerMessage = customerTemplate(payload as SubscriptionCancelledPayload)

      if (payload.customerPhone && payload.customerPhone.trim()) {
        try {
          await sendSms(payload.customerPhone, customerMessage)
          await logSms(payload.customerPhone, customerMessage, event, 'success')
        } catch (error) {
          await logSms(payload.customerPhone, customerMessage, event, 'error', error instanceof Error ? error.message : String(error))
        }
      } else {
        console.warn('[SMS Dispatcher] Customer phone is empty, skipping SMS')
      }
    }
  } catch (error) {
    console.error('[SMS Dispatcher] Error:', error)
  }
}

