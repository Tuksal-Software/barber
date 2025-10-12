"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { updateBarber, getBarberById } from "@/lib/actions/barber.actions";
import { toast } from "sonner";
import WorkingHoursEditor, { WorkingHour } from "./WorkingHoursEditor";

interface BarberEditModalProps {
  barber: {
    id: string;
    name: string;
    email: string;
    experience: number;
    specialties?: string;
    image?: string;
    slotDuration: number;
    isActive: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultWorkingHours: WorkingHour[] = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isWorking: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isWorking: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isWorking: true },
  { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isWorking: true },
  { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isWorking: true },
  { dayOfWeek: 6, startTime: "09:00", endTime: "16:00", isWorking: true },
  { dayOfWeek: 0, startTime: "10:00", endTime: "16:00", isWorking: false },
];

export function BarberEditModal({ barber, isOpen, onClose, onSuccess }: BarberEditModalProps) {
  const [formData, setFormData] = useState({
    name: barber.name,
    email: barber.email,
    image: barber.image || "",
    slotDuration: barber.slotDuration,
    isActive: barber.isActive,
  });
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(defaultWorkingHours);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen && barber.id) {
      loadBarberWorkingHours();
    }
  }, [isOpen, barber.id]);

  const loadBarberWorkingHours = async () => {
    setIsLoadingData(true);
    try {
      const result = await getBarberById(barber.id);
      if (result.success && result.data?.workingHours) {
        const loadedWorkingHours = result.data.workingHours.map((wh: any) => ({
          dayOfWeek: wh.dayOfWeek,
          startTime: wh.startTime,
          endTime: wh.endTime,
          isWorking: wh.isWorking,
        }));
        
        if (loadedWorkingHours.length > 0) {
          setWorkingHours(loadedWorkingHours);
        }
      }
    } catch (error) {
      console.error("Error loading working hours:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData = {
        ...formData,
        workingHours,
      };

      const result = await updateBarber(barber.id, updateData);

      if (result.success) {
        toast.success("Berber başarıyla güncellendi");
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Güncelleme sırasında hata oluştu");
      }
    } catch (error) {
      toast.error("Güncelleme sırasında hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Berber Düzenle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Temel Bilgiler</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">İsim</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Profil Fotoğrafı URL</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>


          {/* Randevu Ayarları */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Randevu Ayarları</h4>
            <div className="space-y-3">
              <Label>Randevu Slot Süresi</Label>
              <RadioGroup
                value={formData.slotDuration.toString()}
                onValueChange={(value) => handleChange("slotDuration", parseInt(value))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="15" id="15" />
                  <Label htmlFor="15">15 Dakika</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30" id="30" />
                  <Label htmlFor="30">30 Dakika</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="60" id="60" />
                  <Label htmlFor="60">60 Dakika</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Durum */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Durum</h4>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
              <Label htmlFor="isActive">
                {formData.isActive ? "Aktif" : "Pasif"}
              </Label>
            </div>
          </div>

          {/* Çalışma Saatleri */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Çalışma Saatleri</h4>
            {isLoadingData ? (
              <div className="text-center py-4 text-gray-500">
                Çalışma saatleri yükleniyor...
              </div>
            ) : (
              <WorkingHoursEditor
                workingHours={workingHours}
                onChange={setWorkingHours}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
