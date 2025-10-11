"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Edit, 
  Star, 
  Mail, 
  Briefcase, 
  Calendar, 
  Clock,
  MapPin,
  User,
  Phone
} from "lucide-react";

interface BarberDetailModalProps {
  barber: {
    id: string;
    name: string;
    email: string;
    role: string;
    experience: number;
    rating: number;
    specialties?: string;
    image?: string;
    slotDuration: number;
    isActive: boolean;
    workingHours?: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isWorking: boolean;
    }>;
    _count: {
      appointments: number;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function BarberDetailModal({ barber, isOpen, onClose, onEdit }: BarberDetailModalProps) {
  const getDayName = (dayOfWeek: number) => dayNames[dayOfWeek];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Berber Detayları</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profil Bölümü */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={barber.image || ""} />
              <AvatarFallback className="text-2xl">
                {barber.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <h3 className="text-2xl font-bold text-gray-900">{barber.name}</h3>
                <Badge variant={barber.isActive ? "default" : "secondary"}>
                  {barber.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-lg font-semibold">{barber.rating}</span>
                <span className="text-gray-500">({barber._count.appointments} randevu)</span>
              </div>
              
              <Badge variant={barber.role === 'admin' ? 'default' : 'secondary'}>
                {barber.role === 'admin' ? 'Admin' : 'Berber'}
              </Badge>
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                İletişim Bilgileri
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{barber.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deneyim ve Uzmanlık */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Deneyim ve Uzmanlık
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{barber.experience} yıl deneyim</span>
                </div>
                {barber.specialties && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Uzmanlık Alanları:</p>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {barber.specialties}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Çalışma Saatleri */}
          {barber.workingHours && barber.workingHours.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold text-lg mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Çalışma Saatleri
                </h4>
                <div className="space-y-2">
                  {barber.workingHours
                    .filter(wh => wh.isWorking)
                    .map((workingHour) => (
                    <div key={workingHour.dayOfWeek} className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        {getDayName(workingHour.dayOfWeek)}
                      </span>
                      <span className="text-gray-600">
                        {workingHour.startTime} - {workingHour.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Randevu Ayarları */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Randevu Ayarları
              </h4>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">
                  Randevu slot süresi: {barber.slotDuration} dakika
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Kapat
            </Button>
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
