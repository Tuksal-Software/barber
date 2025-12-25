'use server'

import { prisma } from '@/lib/prisma'
import { AuditAction } from '@prisma/client'
import { auditLog } from '@/lib/audit/audit.logger'
import { sendSms } from '@/lib/sms/sms.service'
import { env } from '@/lib/config/env'
import { parseTimeToMinutes } from '@/lib/time'

const otpStore = new Map<string, { code: string; appointmentId: string; expiresAt: number; attemptCount: number }>()

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function normalizePhone(phone: string): string {
  if (!phone) return ''
  if (phone.startsWith('+90')) return phone
  if (phone.startsWith('90')) return `+${phone}`
  if (phone.startsWith('0')) return `+90${phone.slice(1)}`
  if (phone.startsWith('5')) return `+90${phone}`
  return `+90${phone}`
}

export async function requestCancelOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone.match(/^\+90[5][0-9]{9}$/)) {
      return { success: false, error: 'Geçerli bir telefon numarası girin' }
    }

    await auditLog({
      actorType: 'customer',
      actorId: normalizedPhone,
      action: AuditAction.UI_CANCEL_ATTEMPT,
      entityType: 'appointment',
      entityId: null,
      summary: 'Customer attempted to cancel appointment',
      metadata: { phone: normalizedPhone },
    })

    const appointment = await prisma.appointmentRequest.findFirst({
      where: {
        customerPhone: normalizedPhone,
        status: {
          in: ['pending', 'approved'],
        },
      },
      orderBy: [
        { date: 'asc' },
        { requestedStartTime: 'asc' },
      ],
      include: {
        appointmentSlots: true,
      },
    })

    if (!appointment) {
      return { success: false, error: 'Aktif randevunuz bulunamadı' }
    }

    const now = new Date()
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.requestedStartTime}:00`)
    
    if (appointmentDateTime <= now) {
      await auditLog({
        actorType: 'customer',
        actorId: normalizedPhone,
        action: AuditAction.APPOINTMENT_CANCEL_BLOCKED_PAST,
        entityType: 'appointment',
        entityId: appointment.id,
        summary: 'Geçmiş randevu iptal edilmeye çalışıldı',
        metadata: {
          date: appointment.date,
          time: appointment.appointmentSlots[0]?.startTime || appointment.requestedStartTime,
        },
      }).catch(() => {})
      return { success: false, error: 'Geçmiş randevular iptal edilemez' }
    }

    if (appointment.status === 'pending') {
      const otp = generateOtp()
      const expiresAt = Date.now() + 10 * 60 * 1000

      otpStore.set(normalizedPhone, {
        code: otp,
        appointmentId: appointment.id,
        expiresAt,
        attemptCount: 0,
      })

      await auditLog({
        actorType: 'customer',
        actorId: normalizedPhone,
        action: AuditAction.APPOINTMENT_CANCEL_ATTEMPT,
        entityType: 'appointment',
        entityId: appointment.id,
        summary: 'Pending randevu müşteri tarafından iptal edilmeye çalışıldı',
        metadata: { phone: normalizedPhone, appointmentId: appointment.id, status: 'pending' },
      }).catch(() => {})

      const otpMessage = `Randevu iptal kodunuz: ${otp}`
      
      try {
        await sendSms(normalizedPhone, otpMessage)
        await auditLog({
          actorType: 'system',
          action: AuditAction.SMS_SENT,
          entityType: 'sms',
          entityId: null,
          summary: 'OTP SMS sent',
          metadata: { to: normalizedPhone, event: 'CUSTOMER_CANCEL_OTP', sender: 'DEGISIMDJTL' },
        }).catch(() => {})
      } catch (smsError) {
        await auditLog({
          actorType: 'system',
          action: AuditAction.SMS_FAILED,
          entityType: 'sms',
          entityId: null,
          summary: 'OTP SMS failed',
          metadata: { to: normalizedPhone, event: 'CUSTOMER_CANCEL_OTP', error: smsError instanceof Error ? smsError.message : String(smsError) },
        }).catch(() => {})
      }

      return { success: true }
    }

    if (appointment.status === 'approved') {
      await auditLog({
        actorType: 'customer',
        actorId: normalizedPhone,
        action: AuditAction.APPOINTMENT_CANCEL_ATTEMPT,
        entityType: 'appointment',
        entityId: appointment.id,
        summary: 'Onaylı randevu müşteri tarafından iptal edilmeye çalışıldı',
        metadata: { phone: normalizedPhone, appointmentId: appointment.id, status: 'approved' },
      }).catch(() => {})
      return { success: false, error: 'Randevu onaylandı, iptal için işletmeyle iletişime geçin' }
    }

    return { success: false, error: 'Aktif randevunuz bulunamadı' }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Bir hata oluştu' }
  }
}

export async function confirmCancelOtp(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone.match(/^\+90[5][0-9]{9}$/)) {
      return { success: false, error: 'Geçerli bir telefon numarası girin' }
    }

    const stored = otpStore.get(normalizedPhone)

    if (!stored) {
      return { success: false, error: 'OTP bulunamadı. Lütfen tekrar deneyin' }
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(normalizedPhone)
      return { success: false, error: 'OTP süresi doldu. Lütfen tekrar deneyin' }
    }

    if (stored.code !== code) {
      stored.attemptCount++
      otpStore.set(normalizedPhone, stored)

      await auditLog({
        actorType: 'customer',
        actorId: normalizedPhone,
        action: AuditAction.UI_CANCEL_ATTEMPT,
        entityType: 'appointment',
        entityId: stored.appointmentId,
        summary: 'OTP verification failed',
        metadata: { phone: normalizedPhone, appointmentId: stored.appointmentId, attemptCount: stored.attemptCount },
      })

      if (stored.attemptCount >= 3) {
        otpStore.delete(normalizedPhone)
        return { success: false, error: 'Çok fazla hatalı deneme. Lütfen tekrar başlayın' }
      }

      return { success: false, error: 'Yanlış OTP kodu' }
    }

    const appointment = await prisma.appointmentRequest.findUnique({
      where: { id: stored.appointmentId },
      include: {
        appointmentSlots: true,
        barber: true,
      },
    })

    if (!appointment) {
      otpStore.delete(normalizedPhone)
      return { success: false, error: 'Randevu bulunamadı' }
    }

    if (appointment.status !== 'pending') {
      otpStore.delete(normalizedPhone)
      if (appointment.status === 'approved') {
        return { success: false, error: 'Onaylı randevular iptal edilemez' }
      }
      return { success: false, error: 'Bu randevu zaten iptal edilmiş' }
    }

    await auditLog({
      actorType: 'customer',
      actorId: normalizedPhone,
      action: AuditAction.UI_CANCEL_ATTEMPT,
      entityType: 'appointment',
      entityId: appointment.id,
      summary: 'OTP verified for cancel',
      metadata: { phone: normalizedPhone, appointmentId: appointment.id },
    }).catch(() => {})

    await prisma.$transaction(async (tx) => {
      await tx.appointmentRequest.update({
        where: { id: appointment.id },
        data: { status: 'cancelled' },
      })
    })

    otpStore.delete(normalizedPhone)

    await auditLog({
      actorType: 'customer',
      actorId: normalizedPhone,
      action: AuditAction.APPOINTMENT_CANCELLED,
      entityType: 'appointment',
      entityId: appointment.id,
      summary: 'Appointment cancelled by customer',
      metadata: {
        phone: normalizedPhone,
        appointmentId: appointment.id,
        customerName: appointment.customerName,
        date: appointment.date,
        time: appointment.requestedStartTime,
      },
    })

    const customerMessage = `Randevunuz başarıyla iptal edilmiştir. ${appointment.date} ${appointment.requestedStartTime}`
    
    try {
      await sendSms(normalizedPhone, customerMessage)
      await auditLog({
        actorType: 'system',
        action: 'SMS_SENT',
        entityType: 'sms',
        entityId: null,
        summary: 'Customer cancel SMS sent',
        metadata: { to: normalizedPhone, event: 'CUSTOMER_CANCEL_SUCCESS', sender: 'DEGISIMDJTL' },
      })
    } catch (smsError) {
      await auditLog({
        actorType: 'system',
        action: 'SMS_FAILED',
        entityType: 'sms',
        entityId: null,
        summary: 'Customer cancel SMS failed',
        metadata: { to: normalizedPhone, event: 'CUSTOMER_CANCEL_SUCCESS', error: smsError instanceof Error ? smsError.message : String(smsError) },
      })
    }

    if (env.adminPhone) {
      const adminMessage = `Bir müşteri randevusunu iptal etti.\n${appointment.customerName} – ${appointment.date} ${appointment.requestedStartTime}`
      
      try {
        await sendSms(env.adminPhone, adminMessage)
        await auditLog({
          actorType: 'system',
          action: AuditAction.SMS_SENT,
          entityType: 'sms',
          entityId: null,
          summary: 'Admin cancel notification SMS sent',
          metadata: { to: env.adminPhone, event: 'CUSTOMER_CANCEL_ADMIN_NOTIFY', sender: 'DEGISIMDJTL' },
        })
      } catch (smsError) {
        await auditLog({
          actorType: 'system',
          action: AuditAction.SMS_FAILED,
          entityType: 'sms',
          entityId: null,
          summary: 'Admin cancel notification SMS failed',
          metadata: { to: env.adminPhone, event: 'CUSTOMER_CANCEL_ADMIN_NOTIFY', error: smsError instanceof Error ? smsError.message : String(smsError) },
        })
      }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Bir hata oluştu' }
  }
}

