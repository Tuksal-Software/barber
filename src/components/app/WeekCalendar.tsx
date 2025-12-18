"use client"

import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Appointment } from "@/lib/constants"

const statusStyles = {
  pending: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  confirmed: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  completed: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  cancelled: "bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
}

interface WeekCalendarProps {
  weekStart: Date
  appointments: Appointment[]
  onAppointmentClick?: (appointment: Appointment) => void
  className?: string
}

export function WeekCalendar({
  weekStart,
  appointments,
  onAppointmentClick,
  className,
}: WeekCalendarProps) {
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), i)
  )

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) => isSameDay(apt.date, day))
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="border-border grid grid-cols-7 gap-3 border-b pb-3 mb-4">
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className="text-center text-sm font-medium"
          >
            <div className="text-muted-foreground text-xs uppercase tracking-wide">
              {format(day, "EEE", { locale: tr })}
            </div>
            <div className="text-foreground mt-1.5 text-lg font-semibold">
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayAppointments = getAppointmentsForDay(day)
          return (
            <div
              key={day.toISOString()}
              className="border-border min-h-[200px] space-y-1.5 rounded-lg border-2 bg-card p-2.5"
            >
              {dayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => onAppointmentClick?.(apt)}
                  className={cn(
                    "cursor-pointer rounded border p-1.5 text-xs transition-all hover:shadow-sm active:scale-[0.98]",
                    statusStyles[apt.status] || statusStyles.pending
                  )}
                >
                  <div className="font-semibold truncate">{apt.customerName}</div>
                  <div className="text-muted-foreground text-[10px] mt-0.5">
                    {apt.startTime} - {apt.endTime}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

