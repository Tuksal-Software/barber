"use client"

import { cn } from "@/lib/utils"

interface Barber {
  id: string
  name: string
}

interface BarberFilterProps {
  barbers: Barber[]
  selectedBarberId: string | null
  onBarberChange: (barberId: string | null) => void
  showLabel?: boolean
}

export function BarberFilter({
  barbers,
  selectedBarberId,
  onBarberChange,
  showLabel = false,
}: BarberFilterProps) {
  if (barbers.length === 0) {
    return null
  }

  return (
    <div className="flex items-end gap-1 border-b border-border/40">
      {showLabel && (
        <span className="text-xs text-muted-foreground font-medium mr-2 pb-2.5">Berber:</span>
      )}
      <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
        <button
          onClick={() => onBarberChange(null)}
          className={cn(
            "flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-all relative",
            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "border-b-2 border-transparent",
            selectedBarberId === null
              ? "text-foreground border-primary"
              : "text-muted-foreground hover:text-foreground/90 hover:border-border"
          )}
        >
          Tümü
        </button>
        {barbers.map((barber) => (
          <button
            key={barber.id}
            onClick={() => onBarberChange(barber.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-all relative",
              "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "border-b-2 border-transparent",
              selectedBarberId === barber.id
                ? "text-foreground border-primary"
                : "text-muted-foreground hover:text-foreground/90 hover:border-border"
            )}
          >
            {barber.name}
          </button>
        ))}
      </div>
    </div>
  )
}

