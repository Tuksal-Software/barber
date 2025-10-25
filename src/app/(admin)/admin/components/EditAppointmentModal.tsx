"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getAvailableSlots, updateAppointment } from "@/lib/actions/appointment";
import { getAppointmentSettings } from "@/lib/actions/settings";
import { getActiveServices } from "@/lib/actions/services";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { toast } from "sonner";

interface EditAppointmentModalProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditAppointmentModal({
  appointment,
  isOpen,
  onClose,
  onSuccess,
}: EditAppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    appointment?.date ? new Date(appointment.date) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>(appointment?.startTime || "");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [serviceBased, setServiceBased] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    if (appointment?.date) {
      setSelectedDate(new Date(appointment.date));
      setSelectedTime(appointment.startTime);
    }
  }, [appointment]);

  useEffect(() => {
    if (!isOpen) return;
    const init = async () => {
      try {
        const settings = await getAppointmentSettings();
        const isServiceBased = !!settings.data?.serviceBasedDuration;
        setServiceBased(isServiceBased);
        if (isServiceBased) {
          const services = await getActiveServices();
          if (services.success) setAvailableServices(services.data as any);
          if ((appointment as any)?.services) {
            setSelectedServices(((appointment as any).services as any[]).map((s: any) => s.serviceId || s.service?.id).filter(Boolean));
          }
        } else {
          setAvailableServices([]);
          setSelectedServices([]);
        }
      } catch {}
    };
    init();
  }, [isOpen, appointment?.id]);

  useEffect(() => {
    if (selectedDate && appointment?.barberId) {
      loadAvailableSlots();
    }
  }, [selectedDate, serviceBased, selectedServices, appointment?.barberId]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || !appointment?.barberId) return;

    setLoadingSlots(true);
    try {
      const totalDuration = serviceBased
        ? availableServices.filter((s: any) => selectedServices.includes(s.id)).reduce((sum: number, s: any) => sum + s.duration, 0)
        : undefined;
      const result = await getAvailableSlots(appointment.barberId, selectedDate, totalDuration);
      if (result.success && result.data) {
        setAvailableSlots(result.data);
      }
    } catch (error) {
      console.error("Error loading slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const calculateEndTime = (startTime: string, duration: number = 30) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
  };

  const handleSave = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Lütfen tarih ve saat seçin");
      return;
    }

    setLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const res = await updateAppointment(appointment.id, {
        date: dateString,
        startTime: selectedTime,
        serviceIds: serviceBased ? selectedServices : undefined,
      });
      if (res.success) {
        toast.success("Randevu güncellendi");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Randevu güncellenemedi");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Randevu Düzenle</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Müşteri Bilgileri</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Müşteri:</strong> {appointment?.customerName}
              </p>
              <p>
                <strong>Telefon:</strong> {appointment?.customerPhone}
              </p>
              <p>
                <strong>Berber:</strong> {appointment?.barber?.name}
              </p>
            </div>
          </div>

          {serviceBased && (
            <div className="space-y-2">
              <Label>Hizmetler *</Label>
              <ServiceSelection
                services={availableServices as any}
                selectedServices={selectedServices}
                onSelectionChange={setSelectedServices}
              />
              {selectedServices.length === 0 && (
                <p className="text-sm text-red-600">En az bir hizmet seçmelisiniz</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label>Tarih Seçin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Saat Seçin</Label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Müsait saatler yükleniyor...</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.isAvailable && slot.time !== appointment?.startTime}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                        selectedTime === slot.time
                          ? "border-blue-600 bg-blue-600 text-white"
                          : slot.isAvailable || slot.time === appointment?.startTime
                          ? "border-gray-200 hover:border-blue-400 text-gray-700 hover:bg-blue-50"
                          : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {serviceBased && selectedServices.length > 0 && selectedTime && (
              <div className="mt-2 p-3 rounded-lg border border-teal-200 bg-teal-50 text-teal-800">
                <div className="text-sm font-medium mb-1">Hesaplanan Bitiş Saati</div>
                <div className="text-lg font-semibold">
                  {(() => {
                    const total = (availableServices as any[])
                      .filter((s: any) => selectedServices.includes(s.id))
                      .reduce((sum: number, s: any) => sum + s.duration, 0)
                    const [h, m] = selectedTime.split(':').map(Number)
                    const mins = h * 60 + m + total
                    const eh = String(Math.floor(mins / 60)).padStart(2, '0')
                    const em = String(mins % 60).padStart(2, '0')
                    return `${eh}:${em}`
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={loading || !selectedDate || !selectedTime}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "Kaydet"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

