"use client"

import { useMemo } from "react"
import { format, addDays, isSameDay, isPast, startOfDay } from "date-fns"
import { tr } from "date-fns/locale/tr"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HorizontalDatePickerProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date) => void
  className?: string
}

const DAY_NAMES_SHORT = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"]

export function HorizontalDatePicker({
  selectedDate,
  onDateSelect,
  className,
}: HorizontalDatePickerProps) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const tomorrow = useMemo(() => addDays(today, 1), [today])
  
  const dates = useMemo(() => {
    return Array.from({ length: 61 }, (_, i) => addDays(today, i))
  }, [today])

  const isDateDisabled = (date: Date): boolean => {
    return isPast(startOfDay(date)) && !isSameDay(date, today)
  }

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false
    return isSameDay(date, selectedDate)
  }

  const isTodaySelected = useMemo(() => {
    return selectedDate && isSameDay(selectedDate, today)
  }, [selectedDate, today])

  const isTomorrowSelected = useMemo(() => {
    return selectedDate && isSameDay(selectedDate, tomorrow)
  }, [selectedDate, tomorrow])

  const handleTodayClick = () => {
    onDateSelect(today)
  }

  const handleTomorrowClick = () => {
    onDateSelect(tomorrow)
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex gap-2">
        <Button
          variant={isTodaySelected ? "default" : "outline"}
          size="sm"
          onClick={handleTodayClick}
          className={cn(
            "h-8 px-3 text-xs font-medium transition-all duration-200",
            isTodaySelected && "shadow-md shadow-primary/20 ring-2 ring-primary/20"
          )}
        >
          Bugün
        </Button>
        <Button
          variant={isTomorrowSelected ? "default" : "outline"}
          size="sm"
          onClick={handleTomorrowClick}
          className={cn(
            "h-8 px-3 text-xs font-medium transition-all duration-200",
            isTomorrowSelected && "shadow-md shadow-primary/20 ring-2 ring-primary/20"
          )}
        >
          Yarın
        </Button>
      </div>

      <div 
        className="overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div className="flex gap-2 min-w-max">
          {dates.map((date, index) => {
            const dayOfWeek = date.getDay()
            const dayNameIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            const dayName = DAY_NAMES_SHORT[dayNameIndex]
            const dayNumber = format(date, "d")
            const monthName = format(date, "MMMM", { locale: tr })
            const disabled = isDateDisabled(date)
            const selected = isDateSelected(date)
            const isToday = isSameDay(date, today)
            const isWeekStart = dayOfWeek === 1 || (index === 0 && dayOfWeek !== 0)

            return (
              <div 
                key={index} 
                className="flex items-end gap-2"
                style={{ scrollSnapAlign: isWeekStart ? "start" : "none" }}
              >
                <Button
                  variant={selected ? "default" : "outline"}
                  size="sm"
                  disabled={disabled}
                  onClick={() => !disabled && onDateSelect(date)}
                  className={cn(
                    "w-14 h-16 flex flex-col items-center justify-center gap-0.5 overflow-hidden",
                    "transition-all duration-200",
                    disabled && "opacity-50 cursor-not-allowed",
                    selected && !disabled && "ring-2 ring-primary ring-offset-2 shadow-lg shadow-primary/30",
                    !disabled && !selected && "hover:bg-accent",
                    isToday && !selected && "border-primary/50",
                    selected && !disabled && "animate-[fadeIn_0.2s_ease-in-out]"
                  )}
                >
                  <span className={cn(
                    "text-[11px] font-medium leading-none",
                    selected ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {dayName}
                  </span>
                  <span className={cn(
                    "text-[10px] leading-none whitespace-nowrap",
                    selected ? "text-primary-foreground/60" : "text-muted-foreground/80",
                    disabled && "opacity-50"
                  )}>
                    {monthName}
                  </span>
                  <span className={cn(
                    "text-[15px] font-semibold leading-none",
                    selected && "text-primary-foreground",
                    !selected && "text-foreground"
                  )}>
                    {dayNumber}
                  </span>
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

