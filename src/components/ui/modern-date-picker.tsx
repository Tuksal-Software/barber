"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, addDays, subDays } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ModernDatePickerProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
  maxDate?: Date
}

export function ModernDatePicker({
  selected,
  onSelect,
  disabled,
  className,
  maxDate
}: ModernDatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const defaultMaxDate = React.useMemo(() => {
    const max = new Date()
    max.setDate(max.getDate() + 30)
    max.setHours(23, 59, 59, 999)
    return max
  }, [])

  const finalMaxDate = maxDate || defaultMaxDate

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  
  // Önceki ayın son günlerini al
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - monthStart.getDay() + 1) // Pazartesi'den başla
  
  // Sonraki ayın ilk günlerini al
  const endDate = new Date(monthEnd)
  const daysToAdd = 7 - (monthEnd.getDay() || 7)
  endDate.setDate(endDate.getDate() + daysToAdd)
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const isDisabled = (date: Date) => {
    if (disabled) return disabled(date)
    return date < today || date > finalMaxDate
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }

  const handleDateClick = (date: Date) => {
    if (!isDisabled(date)) {
      onSelect?.(date)
    }
  }

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tarih Seçin</h3>
              <p className="text-teal-100 text-sm">Uygun tarihi seçerek devam edin</p>
            </div>
          </div>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {format(currentMonth, 'MMMM yyyy', { locale: tr })}
            </h2>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-semibold text-gray-500 py-2">
                {day}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentMonth)
            const isSelected = selected && isSameDay(date, selected)
            const isTodayDate = isToday(date)
            const disabled = isDisabled(date)
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={disabled}
                className={cn(
                  "relative h-12 w-12 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center",
                  "hover:scale-105 active:scale-95",
                  {
                    // Normal days
                    "text-gray-600 hover:bg-teal-50 hover:text-teal-600": isCurrentMonth && !isSelected && !isTodayDate && !disabled,
                    
                    // Other month days
                    "text-gray-300 hover:bg-gray-50": !isCurrentMonth && !disabled,
                    
                    // Today
                    "bg-teal-100 text-teal-700 font-semibold ring-2 ring-teal-300": isTodayDate && !isSelected && !disabled,
                    
                    // Selected
                    "bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-semibold shadow-lg": isSelected,
                    
                    // Disabled
                    "text-gray-300 bg-gray-50 cursor-not-allowed opacity-50": disabled,
                    
                    // Current month indicator
                    "font-semibold": isCurrentMonth && !disabled,
                  }
                )}
              >
                {format(date, 'd')}
                
                {/* Today indicator dot */}
                {isTodayDate && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full" />
                )}
                
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-100 rounded-full ring-2 ring-teal-300"></div>
              <span>Bugün</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full"></div>
              <span>Seçili</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-50 rounded-full opacity-50"></div>
              <span>Müsait Değil</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
