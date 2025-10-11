"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";

interface BarberFilterProps {
  barbers: Array<{
    id: string;
    name: string;
    image?: string;
  }>;
  selectedBarber: string;
  onBarberChange: (barberId: string) => void;
}

export function BarberFilter({ barbers, selectedBarber, onBarberChange }: BarberFilterProps) {
  return (
    <div className="flex items-center space-x-2">
      <Users className="h-5 w-5 text-gray-400" />
      <Select value={selectedBarber} onValueChange={onBarberChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Berber seçin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Berberler</SelectItem>
          {barbers.map((barber) => (
            <SelectItem key={barber.id} value={barber.id}>
              {barber.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
