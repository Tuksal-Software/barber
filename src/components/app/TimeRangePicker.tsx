"use client"

import { memo, useMemo } from "react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  selectedTime?: string | null
  onTimeSelect: (time: string | null) => void
  availableSlots?: Array<{ startTime: string; endTime: string }>
  selectedDate?: Date
  blockedSlots?: Array<{ startTime: string; endTime: string }>
  bookedRequests?: Array<{ startTime: string }>
  className?: string
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function overlaps(
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

export const TimeRangePicker = memo(function TimeRangePicker({
  selectedTime,
  onTimeSelect,
  availableSlots = [],
  selectedDate,
  blockedSlots = [],
  bookedRequests = [],
  className,
}: TimePickerProps) {
  const timeSlots = useMemo(() => {
    if (availableSlots.length === 0) {
      return []
    }

    const allStartTimes = new Set<number>()
    const allEndTimes = new Set<number>()

    availableSlots.forEach((slot) => {
      allStartTimes.add(parseTimeToMinutes(slot.startTime))
      allEndTimes.add(parseTimeToMinutes(slot.endTime))
    })

    const minStart = Math.min(...Array.from(allStartTimes))
    const maxEnd = Math.max(...Array.from(allEndTimes))

    const timeSlotsList: string[] = []
    
    // 30 dk adımlı saatler üret (10:00, 10:30, 11:00, 11:30, ...)
    // minStart'i 30 dk'ya yuvarla (aşağıya)
    let currentMinutes = Math.floor(minStart / 30) * 30
    
    // endTime dahil olacak şekilde: son slot [T, T+30] olmalı, yani T <= maxEnd - 30
    while (currentMinutes <= maxEnd - 30) {
      timeSlotsList.push(minutesToTime(currentMinutes))
      currentMinutes += 30
    }

    return timeSlotsList
  }, [availableSlots])

  const filteredTimes = useMemo(() => {
    if (!selectedDate) {
      return timeSlots
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    
    const isToday = today.getTime() === selectedDay.getTime()

    if (!isToday) {
      return timeSlots
    }

    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const twoHoursLaterMinutes = twoHoursLater.getHours() * 60 + twoHoursLater.getMinutes()
    // Bir üst 30 dk'ya yuvarla
    const earliestAllowedMinutes = Math.ceil(twoHoursLaterMinutes / 30) * 30
    const earliestAllowedStart = minutesToTime(earliestAllowedMinutes)

    return timeSlots.filter((time) => {
      return time >= earliestAllowedStart
    })
  }, [timeSlots, selectedDate])

  const sortedTimes = [...filteredTimes].sort((a, b) => 
    a.localeCompare(b)
  )

  const handleTimeClick = (time: string) => {
    if (isBooked(time)) {
      return
    }
    if (selectedTime === time) {
      onTimeSelect(null)
    } else {
      onTimeSelect(time)
    }
  }

  const isSelected = (time: string) => {
    return selectedTime === time
  }

  const isBooked = (time: string) => {
    // Her saat butonu [T, T+30] aralığını temsil eder
    const timeMinutes = parseTimeToMinutes(time)
    const slotStart = time
    const slotEndMinutes = timeMinutes + 30
    const slotEnd = minutesToTime(slotEndMinutes)

    // AppointmentSlot kontrolü: slot.start < T+30 && slot.end > T
    for (const blockedSlot of blockedSlots) {
      if (overlaps(slotStart, slotEnd, blockedSlot.startTime, blockedSlot.endTime)) {
        return true
      }
    }

    // AppointmentRequest kontrolü (pending/approved): startTime tam eşleşme
    for (const bookedRequest of bookedRequests) {
      if (bookedRequest.startTime === time) {
        return true
      }
    }

    return false
  }

  if (sortedTimes.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        Müsait saat yok
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5", className)}>
      {sortedTimes.map((time) => {
        const selected = isSelected(time)
        const booked = isBooked(time)

        return (
          <button
            key={time}
            type="button"
            onClick={() => handleTimeClick(time)}
            disabled={booked}
            className={cn(
              "relative rounded-lg border-2 py-3 px-2 text-sm font-semibold transition-all duration-200 touch-manipulation",
              "min-h-[48px] flex items-center justify-center",
              booked
                ? "border-destructive/30 bg-muted/50 text-muted-foreground opacity-60 cursor-not-allowed"
                : selected
                ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/20"
                : "border-border bg-background hover:border-primary/50 hover:bg-primary/5 active:scale-95"
            )}
          >
            {time}
            {booked && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-destructive/20 text-destructive px-1 rounded">
                Dolu
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
})

