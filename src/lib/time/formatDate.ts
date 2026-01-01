import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

export function formatDateTimeTR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: tr })
}

export function formatDateTR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd.MM.yyyy', { locale: tr })
}

export function formatTimeTR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'HH:mm', { locale: tr })
}

export function formatDateLongTR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd MMMM yyyy', { locale: tr })
}

export function formatDateTimeLongTR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd MMMM yyyy HH:mm', { locale: tr })
}

export function formatDateForSms(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return dateString
  }
  
  const dayStr = day.toString().padStart(2, '0')
  const monthStr = month.toString().padStart(2, '0')
  const yearStr = year.toString()
  
  return `${dayStr}.${monthStr}.${yearStr}`
}

export function formatDateTimeForSms(dateString: string, timeString: string): string {
  const formattedDate = formatDateForSms(dateString)
  return `${formattedDate} ${timeString}`
}

