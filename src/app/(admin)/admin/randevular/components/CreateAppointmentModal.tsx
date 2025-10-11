"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { createAppointment } from "@/lib/actions/appointment";
import { getAvailableSlots } from "@/lib/actions/appointment";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  barbers: Array<{
    id: string;
    name: string;
  }>;
}

export function CreateAppointmentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  barbers 
}: CreateAppointmentModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    barberId: "",
    serviceId: "",
    date: new Date(),
    timeSlot: "",
    notes: "",
  });
  const [services, setServices] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // Form yüklendiğinde servisleri al
  useEffect(() => {
    if (isOpen) {
      loadServices();
    }
  }, [isOpen]);

  const loadServices = async () => {
    // Services are not used in the new system
    setServices([]);
  };

  const loadAvailableSlots = async (barberId: string, date: Date) => {
    setLoadingSlots(true);
    try {
      const result = await getAvailableSlots(barberId, date);
      if (result.success && result.data) {
        setAvailableSlots(result.data);
      }
    } catch (error) {
      console.error("Error loading slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const localDate = new Date(formData.date);
      localDate.setHours(0, 0, 0, 0);
      
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const result = await createAppointment({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        notes: formData.notes,
        barberId: formData.barberId,
        date: dateString,
        startTime: formData.timeSlot,
        endTime: calculateEndTime(formData.timeSlot),
      });

      if (result.success) {
        toast.success("Randevu başarıyla oluşturuldu");
        onSuccess();
        onClose();
        resetForm();
      } else {
        toast.error(result.error || "Randevu oluşturulurken hata oluştu");
      }
    } catch (error) {
      toast.error("Randevu oluşturulurken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEndTime = (startTime: string, duration: number = 30) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      barberId: "",
      serviceId: "",
      date: new Date(),
      timeSlot: "",
      notes: "",
    });
    setAvailableSlots([]);
  };

  const handleBarberChange = (barberId: string) => {
    setFormData(prev => ({ ...prev, barberId, timeSlot: "" }));
    if (barberId && formData.date) {
      loadAvailableSlots(barberId, formData.date);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date, timeSlot: "" }));
      if (formData.barberId) {
        loadAvailableSlots(formData.barberId, date);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Yeni Randevu Oluştur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Müşteri Bilgileri */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Müşteri Bilgileri</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Müşteri Adı *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefon *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email (Opsiyonel)</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
              />
            </div>
          </div>

          {/* Randevu Detayları */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Randevu Detayları</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Berber *</Label>
                <Select value={formData.barberId} onValueChange={handleBarberChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Berber seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hizmet *</Label>
                <Select value={formData.serviceId} onValueChange={(value) => setFormData(prev => ({ ...prev, serviceId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hizmet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tarih *</Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP", { locale: tr }) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Saat *</Label>
                <Select 
                  value={formData.timeSlot} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, timeSlot: value }))}
                  disabled={loadingSlots || availableSlots.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loadingSlots ? "Yükleniyor..." : 
                      availableSlots.length === 0 ? "Önce berber ve tarih seçin" :
                      "Saat seçin"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem 
                        key={slot.time} 
                        value={slot.time}
                        disabled={!slot.isAvailable}
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{slot.time}</span>
                          {!slot.isAvailable && (
                            <span className="text-xs text-red-500">(Dolu)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Randevu notları..."
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
