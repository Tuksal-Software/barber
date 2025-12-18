"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"

interface TimeRangePickerProps {
  selectedStart?: string
  selectedEnd?: string
  onStartSelect: (time: string) => void
  onEndSelect: (time: string) => void
  availableSlots?: Array<{ startTime: string; endTime: string }>
  className?: string
}

export const TimeRangePicker = memo(function TimeRangePicker({
  selectedStart,
  selectedEnd,
  onStartSelect,
  onEndSelect,
  availableSlots = [],
  className,
}: TimeRangePickerProps) {
  const allTimes = new Set<string>()
  availableSlots.forEach((slot) => {
    allTimes.add(slot.startTime)
    allTimes.add(slot.endTime)
  })
  const sortedTimes = Array.from(allTimes).sort()

  const handleTimeClick = (time: string) => {
    const isAvailable = availableSlots.some(
      (slot) => slot.startTime === time || slot.endTime === time
    )
    if (!isAvailable) return

    if (!selectedStart) {
      onStartSelect(time)
    } else if (!selectedEnd) {
      if (time > selectedStart) {
        onEndSelect(time)
      } else {
        onStartSelect(time)
        onEndSelect("")
      }
    } else {
      onStartSelect(time)
      onEndSelect("")
    }
  }

  const isInRange = (time: string) => {
    if (!selectedStart || !selectedEnd) return false
    return time > selectedStart && time < selectedEnd
  }

  const isSelected = (time: string) => {
    return time === selectedStart || time === selectedEnd
  }

  const isStartSelected = (time: string) => {
    return time === selectedStart
  }

  const isAvailable = (time: string) => {
    return availableSlots.some(
      (slot) => slot.startTime === time || slot.endTime === time
    )
  }

  if (sortedTimes.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        Müsait saat yok
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6", className)}>
      {sortedTimes.map((time) => {
        const available = isAvailable(time)
        const inRange = isInRange(time)
        const selected = isSelected(time)
        const isStart = isStartSelected(time)

        return (
          <button
            key={time}
            type="button"
            onClick={() => handleTimeClick(time)}
            disabled={!available}
            className={cn(
              "relative rounded-lg border-2 py-3 px-2 text-sm font-semibold transition-all duration-200 touch-manipulation",
              "min-h-[48px] flex items-center justify-center",
              !available &&
                "cursor-not-allowed bg-muted/30 text-muted-foreground opacity-40 border-muted",
              available &&
                !selected &&
                !inRange &&
                "border-border bg-background hover:border-primary/50 hover:bg-primary/5 active:scale-95",
              isStart &&
                "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/20",
              selected &&
                !isStart &&
                "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20",
              inRange &&
                !selected &&
                "border-primary/40 bg-primary/10 text-primary border-dashed"
            )}
          >
            {time}
          </button>
        )
      })}
    </div>
  )
})

