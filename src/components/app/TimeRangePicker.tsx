"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"

interface TimeRangePickerProps {
  selectedStart?: string
  onStartSelect: (time: string) => void
  timeButtons?: Array<{ time: string; disabled: boolean }>
  className?: string
}

export const TimeRangePicker = memo(function TimeRangePicker({
  selectedStart,
  onStartSelect,
  timeButtons = [],
  className,
}: TimeRangePickerProps) {
  const handleTimeClick = (time: string) => {
    onStartSelect(time)
  }

  if (timeButtons.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        Müsait saat yok
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6", className)}>
      {timeButtons.map((button) => {
        const isSelected = button.time === selectedStart

        return (
          <button
            key={button.time}
            type="button"
            onClick={() => handleTimeClick(button.time)}
            disabled={button.disabled}
            className={cn(
              "relative rounded-lg border-2 py-3 px-2 text-sm font-semibold transition-all duration-200 touch-manipulation",
              "min-h-[48px] flex items-center justify-center",
              button.disabled &&
                "cursor-not-allowed bg-muted/30 text-muted-foreground opacity-50 border-red-500/60 hover:border-red-500/60 hover:bg-muted/30",
              !button.disabled &&
                !isSelected &&
                "border-border bg-background hover:border-primary/50 hover:bg-primary/5 active:scale-95",
              isSelected &&
                "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/20"
            )}
          >
            {button.time}
            {button.disabled && (
              <span 
                className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white leading-none font-medium"
                style={{
                  animation: 'fadeIn 0.3s ease-in-out, scaleIn 0.3s ease-in-out'
                }}
              >
                Dolu
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
})

