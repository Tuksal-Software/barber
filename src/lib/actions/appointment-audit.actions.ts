'use server'

import { auditLog } from '@/lib/audit/audit.logger'

export interface LogFormPhoneEnteredInput {
  phone: string
  barberId: string
  date: string
}

export interface LogFormNameEnteredInput {
  name: string
  phone: string
  barberId: string
  date: string
}

export interface LogFormAbandonedInput {
  phone?: string
  name?: string
  barberId: string
  date: string
  step: string
}

export async function logAppointmentFormPhoneEntered(
  input: LogFormPhoneEnteredInput
): Promise<void> {
  try {
    await auditLog({
      actorType: 'customer',
      action: 'APPOINTMENT_FORM_PHONE_ENTERED',
      entityType: 'ui',
      entityId: null,
      summary: 'Customer phone entered',
      metadata: {
        phone: input.phone,
        barberId: input.barberId,
        date: input.date,
        step: 'phone_step',
      },
    })
  } catch {
  }
}

export async function logAppointmentFormNameEntered(
  input: LogFormNameEnteredInput
): Promise<void> {
  try {
    await auditLog({
      actorType: 'customer',
      action: 'APPOINTMENT_FORM_NAME_ENTERED',
      entityType: 'ui',
      entityId: null,
      summary: 'Customer name entered',
      metadata: {
        name: input.name,
        phone: input.phone,
        barberId: input.barberId,
        date: input.date,
        step: 'name_step',
      },
    })
  } catch {
  }
}

export async function logAppointmentFormAbandoned(
  input: LogFormAbandonedInput
): Promise<void> {
  try {
    await auditLog({
      actorType: 'customer',
      action: 'APPOINTMENT_FORM_ABANDONED',
      entityType: 'ui',
      entityId: null,
      summary: 'Appointment form abandoned',
      metadata: {
        phone: input.phone || null,
        name: input.name || null,
        barberId: input.barberId,
        date: input.date,
        step: input.step,
      },
    })
  } catch {
  }
}


