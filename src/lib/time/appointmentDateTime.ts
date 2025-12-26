export function getNowTR(): Date {
  const now = new Date()
  const trOffset = 3 * 60 * 60 * 1000
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)
  return new Date(utc + trOffset)
}

export function createAppointmentDateTimeTR(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Geçersiz tarih veya saat: ${date} ${time}`)
  }
  
  return new Date(year, month - 1, day, hours, minutes, 0, 0)
}

export function createAppointmentDateTime(date: string, time: string): Date {
  return createAppointmentDateTimeTR(date, time)
}

export function isAppointmentInPast(date: string, time: string): boolean {
  const appointmentDateTime = createAppointmentDateTimeTR(date, time)
  const nowTR = getNowTR()
  return appointmentDateTime.getTime() <= nowTR.getTime()
}

export function isAppointmentInFuture(date: string, time: string): boolean {
  const appointmentDateTime = createAppointmentDateTimeTR(date, time)
  const nowTR = getNowTR()
  return appointmentDateTime.getTime() > nowTR.getTime()
}

export function getHoursUntilAppointment(date: string, time: string): number {
  const appointmentDateTime = createAppointmentDateTimeTR(date, time)
  const nowTR = getNowTR()
  const diffMs = appointmentDateTime.getTime() - nowTR.getTime()
  return diffMs / (1000 * 60 * 60)
}

