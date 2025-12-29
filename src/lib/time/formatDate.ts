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

