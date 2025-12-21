export function parseTimeToMinutes(time: string): number {
  if (time == null || time === undefined) {
    throw new Error('Saat bilgisi yok')
  }
  const [hours, minutes] = time.split(':').map(Number)
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Geçersiz saat formatı: ${time}`)
  }
  return hours * 60 + minutes
}

export function minutesToTime(minutes: number): string {
  if (minutes < 0 || minutes >= 24 * 60) {
    throw new Error(`Geçersiz dakika değeri: ${minutes}`)
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function overlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const startAMinutes = parseTimeToMinutes(startA)
  const endAMinutes = parseTimeToMinutes(endA)
  const startBMinutes = parseTimeToMinutes(startB)
  const endBMinutes = parseTimeToMinutes(endB)

  return startAMinutes < endBMinutes && startBMinutes < endAMinutes
}






