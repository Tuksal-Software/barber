'use server'

import { prisma } from '@/lib/prisma'
import { AuditAction } from '@prisma/client'
import { auditLog } from '@/lib/audit/audit.logger'
import { sendSms } from '@/lib/sms/sms.service'
import { env } from '@/lib/config/env'
import { createAppointmentDateTimeTR, getNowTR, isAppointmentInPast, getHoursUntilAppointment } from '@/lib/time/appointmentDateTime'
import { getSetting } from '@/lib/settings/settings.service'
import { defaultSettings } from '@/lib/settings/defaults'

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

    try {
      await auditLog({
        actorType: 'customer',
        actorId: normalizedPhone,
        action: AuditAction.UI_CANCEL_ATTEMPT,
        entityType: 'appointment',
        entityId: null,
        summary: 'Customer attempted to cancel appointment',
        metadata: { phone: normalizedPhone },
      })
    } catch (error) {
      console.error('Audit log error:', error)
    }

    const allAppointments = await prisma.appointmentRequest.findMany({
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

    const nowTR = getNowTR()
    let appointment = null

    for (const apt of allAppointments) {
      const appointmentDateTime = createAppointmentDateTimeTR(apt.date, apt.requestedStartTime)
      if (appointmentDateTime.getTime() > nowTR.getTime()) {
        appointment = apt
        break
      }
    }

    if (!appointment) {
      return { success: false, error: 'İptal edilebilecek aktif bir randevunuz bulunamadı.' }
    }

    if (isAppointmentInPast(appointment.date, appointment.requestedStartTime)) {
      try {
        await auditLog({
          actorType: 'customer',
          actorId: normalizedPhone,
          action: AuditAction.APPOINTMENT_CANCEL_BLOCKED_PAST,
          entityType: 'appointment',
          entityId: appointment.id,
          summary: 'Geçmiş randevu iptal edilmeye çalışıldı',
          metadata: {
            date: appointment.date,
            time: appointment.requestedStartTime,
          },
        })
      } catch (error) {
        console.error('Audit log error:', error)
      }
      return { success: false, error: 'Geçmiş randevular iptal edilemez' }
    }

    if (appointment.status === 'pending') {
      const otp = generateOtp()
      const nowTR = getNowTR()
      const expiresAt = new Date(nowTR.getTime() + 10 * 60 * 1000)

      await prisma.customerCancelOtp.create({
        data: {
          phone: normalizedPhone,
          code: otp,
          appointmentId: appointment.id,
          expiresAt,
          used: false,
        },
      })

      try {
        await auditLog({
          actorType: 'customer',
          actorId: normalizedPhone,
          action: AuditAction.APPOINTMENT_CANCEL_ATTEMPT,
          entityType: 'appointment',
          entityId: appointment.id,
          summary: 'Pending randevu müşteri tarafından iptal edilmeye çalışıldı',
          metadata: { phone: normalizedPhone, appointmentId: appointment.id, status: 'pending' },
        })
      } catch (error) {
        console.error('Audit log error:', error)
      }

      const otpMessage = `Randevu iptal kodunuz: ${otp}`

      try {
        await sendSms(normalizedPhone, otpMessage)
        try {
          await prisma.smsLog.create({
            data: {
              to: normalizedPhone,
              message: otpMessage,
              event: 'CUSTOMER_CANCEL_OTP',
              provider: 'vatansms',
              status: 'success',
              error: null,
            },
          })
        } catch (error) {
          console.error('SMS log error:', error)
        }
        try {
          await auditLog({
            actorType: 'system',
            action: AuditAction.CUSTOMER_CANCEL_OTP_SENT,
            entityType: 'appointment',
            entityId: appointment.id,
            summary: 'OTP SMS sent',
            metadata: { to: normalizedPhone, event: 'CUSTOMER_CANCEL_OTP', sender: 'DEGISIMDJTL' },
          })
        } catch (error) {
          console.error('Audit log error:', error)
        }
      } catch (smsError) {
        try {
          await prisma.smsLog.create({
            data: {
              to: normalizedPhone,
              message: otpMessage,
              event: 'CUSTOMER_CANCEL_OTP',
              provider: 'vatansms',
              status: 'error',
              error: smsError instanceof Error ? smsError.message : String(smsError),
            },
          })
        } catch (error) {
          console.error('SMS log error:', error)
        }
        try {
          await auditLog({
            actorType: 'system',
            action: AuditAction.SMS_FAILED,
            entityType: 'sms',
            entityId: null,
            summary: 'OTP SMS failed',
            metadata: { to: normalizedPhone, event: 'CUSTOMER_CANCEL_OTP', error: smsError instanceof Error ? smsError.message : String(smsError) },
          })
        } catch (error) {
          console.error('Audit log error:', error)
        }
      }

      return { success: true }
    }

    if (appointment.status === 'approved') {
      const customerCancelSettings = await getSetting<{ approvedMinHours: number }>(
        'customerCancel',
        defaultSettings.customerCancel
      )
      const limitHours = Number(customerCancelSettings.approvedMinHours) || 2
      const diffInHours = getHoursUntilAppointment(appointment.date, appointment.requestedStartTime)

      console.log(`[Customer Cancel] Approved appointment cancel check - limitHours: ${limitHours}, diffInHours: ${diffInHours}`)

      if (diffInHours < limitHours) {
        try {
          await auditLog({
            actorType: 'customer',
            actorId: normalizedPhone,
            action: AuditAction.APPOINTMENT_CANCEL_BLOCKED_PAST,
            entityType: 'appointment',
            entityId: appointment.id,
            summary: `Onaylı randevu ${limitHours} saatten az kaldığı için iptal edilemedi`,
            metadata: { phone: normalizedPhone, appointmentId: appointment.id, diffInHours, limitHours },
          })
        } catch (error) {
          console.error('Audit log error:', error)
        }
        return { success: false, error: `Randevuya ${limitHours} saatten az kaldığı için iptal edilemez. Lütfen işletmeyle iletişime geçin.` }
      }

      const otp = generateOtp()
      const nowTR = getNowTR()
      const expiresAt = new Date(nowTR.getTime() + 10 * 60 * 1000)

      await prisma.customerCancelOtp.create({
        data: {
          phone: normalizedPhone,
          code: otp,
          appointmentId: appointment.id,
          expiresAt,
          used: false,
        },
      })

      try {
        await auditLog({
          actorType: 'customer',
          actorId: normalizedPhone,
          action: AuditAction.APPOINTMENT_CANCEL_ATTEMPT,
          entityType: 'appointment',
          entityId: appointment.id,
          summary: 'Onaylı randevu müşteri tarafından iptal edilmeye çalışıldı',
          metadata: { phone: normalizedPhone, appointmentId: appointment.id, status: 'approved', diffInHours },
        })
      } catch (error) {
        console.error('Audit log error:', error)
      }

      const otpMessage = `Randevu iptal kodunuz: ${otp}`

      try {
        await sendSms(normalizedPhone, otpMessage)
        try {
          await prisma.smsLog.create({
            data: {
              to: normalizedPhone,
              message: otpMessage,
              event: 'CUSTOMER_CANCEL_OTP',
              provider: 'vatansms',
              status: 'success',
              error: null,
            },
          })
        } catch (error) {
          console.error('SMS log error:', error)
        }
        try {
          await auditLog({
            actorType: 'system',
            action: AuditAction.CUSTOMER_CANCEL_OTP_SENT,
            entityType: 'appointment',
            entityId: appointment.id,
            summary: 'OTP SMS sent',
            metadata: { to: normalizedPhone, event: 'CUSTOMER_CANCEL_OTP', sender: 'DEGISIMDJTL' },
          })
        } catch (error) {
          console.error('Audit log error:', error)
        }
      } catch (smsError) {
        try {
          await prisma.smsLog.create({
            data: {
              to: normalizedPhone,
              message: otpMessage,
              event: 'CUSTOMER_CANCEL_OTP',
              provider: 'vatansms',
              status: 'error',
              error: smsError instanceof Error ? smsError.message : String(smsError),
            },
          })
        } catch (error) {
          console.error('SMS log error:', error)
        }
        try {
          await auditLog({
            actorType: 'system',
            action: AuditAction.SMS_FAILED,
            entityType: 'sms',
            entityId: null,
            summary: 'OTP SMS failed',
            metadata: { to: normalizedPhone, event: 'CUSTOMER_CANCEL_OTP', error: smsError instanceof Error ? smsError.message : String(smsError) },
          })
        } catch (error) {
          console.error('Audit log error:', error)
        }
      }

      return { success: true }
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

    const nowTR = getNowTR()
    const otpRecord = await prisma.customerCancelOtp.findFirst({
      where: {
        phone: normalizedPhone,
        code,
        used: false,
        expiresAt: {
          gt: nowTR,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!otpRecord) {
      try {
        await auditLog({
          actorType: 'customer',
          actorId: normalizedPhone,
          action: AuditAction.CUSTOMER_CANCEL_FAILED,
          entityType: 'appointment',
          entityId: null,
          summary: 'OTP verification failed',
          metadata: { phone: normalizedPhone },
        })
      } catch (error) {
        console.error('Audit log error:', error)
      }
      return { success: false, error: 'Girdiğiniz OTP kodu hatalı.' }
    }

    if (otpRecord.expiresAt.getTime() <= nowTR.getTime()) {
      await prisma.customerCancelOtp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      })
      return { success: false, error: 'OTP kodunun süresi dolmuş. Lütfen tekrar deneyin.' }
    }

    const appointment = await prisma.appointmentRequest.findUnique({
      where: { id: otpRecord.appointmentId },
      include: {
        appointmentSlots: true,
        barber: true,
      },
    })

    if (!appointment) {
      await prisma.customerCancelOtp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      })
      return { success: false, error: 'Randevu bulunamadı' }
    }

    if (appointment.status !== 'pending' && appointment.status !== 'approved') {
      await prisma.customerCancelOtp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      })
      return { success: false, error: 'Bu randevu zaten iptal edilmiş' }
    }

    if (isAppointmentInPast(appointment.date, appointment.requestedStartTime)) {
      await prisma.customerCancelOtp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      })
      return { success: false, error: 'Geçmiş randevular iptal edilemez' }
    }

    if (appointment.status === 'approved') {
      const customerCancelSettings = await getSetting<{ approvedMinHours: number }>(
        'customerCancel',
        defaultSettings.customerCancel
      )
      const limitHours = Number(customerCancelSettings.approvedMinHours) || 2
      const diffInHours = getHoursUntilAppointment(appointment.date, appointment.requestedStartTime)

      console.log(`[Customer Cancel] Approved appointment confirm cancel check - limitHours: ${limitHours}, diffInHours: ${diffInHours}`)

      if (diffInHours < limitHours) {
        await prisma.customerCancelOtp.update({
          where: { id: otpRecord.id },
          data: { used: true },
        })
        try {
          await auditLog({
            actorType: 'customer',
            actorId: normalizedPhone,
            action: AuditAction.APPOINTMENT_CANCEL_BLOCKED_PAST,
            entityType: 'appointment',
            entityId: appointment.id,
            summary: `Onaylı randevu ${limitHours} saatten az kaldığı için iptal edilemedi`,
            metadata: { phone: normalizedPhone, appointmentId: appointment.id, diffInHours, limitHours },
          })
        } catch (error) {
          console.error('Audit log error:', error)
        }
        return { success: false, error: `Randevuya ${limitHours} saatten az kaldığı için iptal edilemez. Lütfen işletmeyle iletişime geçin.` }
      }
    }

    await prisma.$transaction(async (tx) => {
      if (appointment.status === 'approved') {
        await tx.appointmentSlot.deleteMany({
          where: {
            appointmentRequestId: appointment.id,
          },
        })
      }

      await tx.appointmentRequest.update({
        where: { id: appointment.id },
        data: {
          status: 'cancelled',
          cancelledBy: 'customer' as any,
        },
      })

      await tx.customerCancelOtp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      })
    })

    try {
      await auditLog({
        actorType: 'customer',
        actorId: normalizedPhone,
        action: AuditAction.CUSTOMER_CANCEL_CONFIRMED,
        entityType: 'appointment',
        entityId: appointment.id,
        summary: 'OTP verified and appointment cancelled',
        metadata: { phone: normalizedPhone, appointmentId: appointment.id },
      })
    } catch (error) {
      console.error('Audit log error:', error)
    }

    try {
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
    } catch (error) {
      console.error('Audit log error:', error)
    }

    const customerMessage = `Randevunuz başarıyla iptal edilmiştir. ${appointment.date} ${appointment.requestedStartTime}`

    try {
      await sendSms(normalizedPhone, customerMessage)
      try {
        await prisma.smsLog.create({
          data: {
            to: normalizedPhone,
            message: customerMessage,
            event: 'CUSTOMER_CANCEL_SUCCESS',
            provider: 'vatansms',
            status: 'success',
            error: null,
          },
        })
      } catch (error) {
        console.error('SMS log error:', error)
      }
      try {
        await auditLog({
          actorType: 'system',
          action: AuditAction.SMS_SENT,
          entityType: 'sms',
          entityId: null,
          summary: 'Customer cancel SMS sent',
          metadata: { to: normalizedPhone, event: 'CUSTOMER_CANCEL_SUCCESS', sender: 'DEGISIMDJTL' },
        })
      } catch (error) {
        console.error('Audit log error:', error)
      }
    } catch (smsError) {
      try {
        await prisma.smsLog.create({
          data: {
            to: normalizedPhone,
            message: customerMessage,
            event: 'CUSTOMER_CANCEL_SUCCESS',
            provider: 'vatansms',
            status: 'error',
            error: smsError instanceof Error ? smsError.message : String(smsError),
          },
        })
      } catch (error) {
        console.error('SMS log error:', error)
      }
      try {
        await auditLog({
          actorType: 'system',
          action: AuditAction.SMS_FAILED,
          entityType: 'sms',
          entityId: null,
          summary: 'Customer cancel SMS failed',
          metadata: { to: normalizedPhone, event: 'CUSTOMER_CANCEL_SUCCESS', error: smsError instanceof Error ? smsError.message : String(smsError) },
        })
      } catch (error) {
        console.error('Audit log error:', error)
      }
    }

    const { getAdminPhoneSetting, getSmsSenderSetting } = await import('@/lib/settings/settings-helpers')
    const adminPhone = await getAdminPhoneSetting()
    if (adminPhone) {
      const adminMessage = `📌 Müşteri tarafından iptal edildi:\n${appointment.customerName} – ${appointment.date} ${appointment.requestedStartTime}`

      try {
        await sendSms(adminPhone, adminMessage)
        const smsSender = await getSmsSenderSetting()
        try {
          await prisma.smsLog.create({
            data: {
              to: adminPhone,
              message: adminMessage,
              event: 'CUSTOMER_CANCEL_ADMIN_NOTIFY',
              provider: 'vatansms',
              status: 'success',
              error: null,
            },
          })
        } catch (error) {
          console.error('SMS log error:', error)
        }
        try {
          await auditLog({
            actorType: 'system',
            action: AuditAction.SMS_SENT,
            entityType: 'sms',
            entityId: null,
            summary: 'Admin cancel notification SMS sent',
            metadata: { to: adminPhone, event: 'CUSTOMER_CANCEL_ADMIN_NOTIFY', sender: smsSender },
          })
        } catch (error) {
          console.error('Audit log error:', error)
        }
      } catch (smsError) {
        try {
          await prisma.smsLog.create({
            data: {
              to: adminPhone,
              message: adminMessage,
              event: 'CUSTOMER_CANCEL_ADMIN_NOTIFY',
              provider: 'vatansms',
              status: 'error',
              error: smsError instanceof Error ? smsError.message : String(smsError),
            },
          })
        } catch (error) {
          console.error('SMS log error:', error)
        }
        try {
          const smsSender = await getSmsSenderSetting()
          await auditLog({
            actorType: 'system',
            action: AuditAction.SMS_FAILED,
            entityType: 'sms',
            entityId: null,
            summary: 'Admin cancel notification SMS failed',
            metadata: { to: adminPhone, event: 'CUSTOMER_CANCEL_ADMIN_NOTIFY', sender: smsSender, error: smsError instanceof Error ? smsError.message : String(smsError) },
          })
        } catch (error) {
          console.error('Audit log error:', error)
        }
      }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Bir hata oluştu' }
  }
}

