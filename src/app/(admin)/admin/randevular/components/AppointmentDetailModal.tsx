"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import { getAppointmentSettings } from "@/lib/actions/settings";
import { getAppointmentWithServices } from "@/lib/actions/appointment";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Scissors,
  Edit,
  Trash2,
  Save
} from "lucide-react";
import { updateAppointmentStatus, deleteAppointment } from "@/lib/actions/appointment";
import { toast } from "sonner";

interface AppointmentDetailModalProps {
  appointment: {
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: string;
    notes?: string;
    barber: {
      id: string;
      name: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Beklemede', color: 'secondary' },
  { value: 'confirmed', label: 'Onaylandı', color: 'success' },
  { value: 'completed', label: 'Tamamlandı', color: 'default' },
  { value: 'cancelled', label: 'İptal Edildi', color: 'destructive' },
];

export function AppointmentDetailModal({ 
  appointment, 
  isOpen, 
  onClose, 
  onSuccess 
}: AppointmentDetailModalProps) {
  const [status, setStatus] = useState(appointment.status);
  const [notes, setNotes] = useState(appointment.notes || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceBased, setServiceBased] = useState(false);
  const [servicesDetail, setServicesDetail] = useState<any[] | null>(null);

  useEffect(() => {
    const load = async () => {
      const s = await getAppointmentSettings();
      const sb = !!s.data?.serviceBasedDuration;
      setServiceBased(sb);
      if (sb) {
        const res = await getAppointmentWithServices(appointment.id);
        if (res.success) {
          // @ts-ignore
          setServicesDetail(res.data.services || []);
        }
      } else {
        setServicesDetail(null);
      }
    }
    if (isOpen) load();
  }, [isOpen, appointment.id]);

  useEffect(() => {
    if (isOpen) {
      setStatus(appointment.status);
      setNotes(appointment.notes || '');
    }
  }, [isOpen, appointment.status, appointment.notes]);

  const handleStatusUpdate = async () => {
    setIsLoading(true);
    try {
      const result = await updateAppointmentStatus(appointment.id, status as any, notes);
      if (result.success) {
        toast.success("Randevu güncellendi");
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

  const handleDelete = async () => {
    if (!confirm("Bu randevuyu silmek istediğinizden emin misiniz?")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteAppointment(appointment.id);
      if (result.success) {
        toast.success("Randevu silindi");
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Silme sırasında hata oluştu");
      }
    } catch (error) {
      toast.error("Silme sırasında hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? { label: option.label, variant: option.color as any } : { label: statusValue, variant: 'secondary' as any };
  };

  const statusBadge = getStatusBadge(status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Randevu Detayları</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Müşteri Bilgileri */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Müşteri Bilgileri
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 font-medium">{appointment.customerName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{appointment.customerPhone}</span>
                </div>
                {appointment.customerEmail && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{appointment.customerEmail}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Randevu Bilgileri */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Randevu Bilgileri
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Scissors className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{appointment.barber.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">
                    {new Date(appointment.date).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{appointment.startTime} - {appointment.endTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        {serviceBased && servicesDetail && servicesDetail.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-4">Seçilen Hizmetler</h4>
              <div className="space-y-2">
                {servicesDetail.map((it: any) => (
                  <div key={it.service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{it.service.name}</p>
                      <p className="text-xs text-gray-500">{it.service.duration} dakika</p>
                    </div>
                    <span className="font-semibold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(it.service.price))}</span>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                <div>
                  <p className="font-semibold">Toplam Süre</p>
                  <p className="text-sm text-gray-600">{(appointment as any).services?.reduce((sum: number, s: any) => sum + s.service.duration, 0) || 0} dakika</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Toplam Ücret</p>
                  <p className="text-2xl font-bold text-teal-700">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number((appointment as any).totalPrice || 0))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

          {/* Durum ve Notlar */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" />
                Durum ve Notlar
              </h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 font-medium">Durum:</span>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-[100]" position="popper" sideOffset={5}>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant={statusBadge.variant}>
                    {statusBadge.label}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Notlar:</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Randevu notları..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Kapat
              </Button>
              <Button 
                onClick={handleStatusUpdate}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
