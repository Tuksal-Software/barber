"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleBarberStatus } from "@/lib/actions/barber.actions";
import { toast } from "sonner";

interface ToggleBarberStatusProps {
  barberId: string;
  isActive: boolean;
}

export function ToggleBarberStatus({ barberId, isActive }: ToggleBarberStatusProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleBarberStatus(barberId);
      if (result.success) {
        toast.success("Berber durumu güncellendi");
      } else {
        toast.error(result.error || "Bir hata oluştu");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
      <span className="text-sm text-gray-600">
        {isActive ? "Aktif" : "Pasif"}
      </span>
    </div>
  );
}
