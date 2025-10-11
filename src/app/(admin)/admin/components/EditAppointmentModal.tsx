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
import { getAvailableSlots } from "@/lib/actions/appointment";

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

  useEffect(() => {
    if (appointment?.date) {
      setSelectedDate(new Date(appointment.date));
      setSelectedTime(appointment.startTime);
    }
  }, [appointment]);

  useEffect(() => {
    if (selectedDate && appointment?.barberId) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || !appointment?.barberId) return;

    setLoadingSlots(true);
    try {
      const result = await getAvailableSlots(appointment.barberId, selectedDate);
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
      alert("Lütfen tarih ve saat seçin");
      return;
    }

    setLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateString,
          startTime: selectedTime,
          endTime: calculateEndTime(selectedTime),
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Randevu güncellenemedi");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Bir hata oluştu");
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

