"use client";

import { useState, useEffect } from "react";
import { getBarbers } from "@/lib/actions/barber.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Edit, 
  Calendar,
  Star,
  User,
  Mail,
  Briefcase,
  Eye
} from "lucide-react";
import Link from "next/link";
import { ToggleBarberStatus } from "./components/ToggleBarberStatus";
import { BarberDetailModal } from "./components/BarberDetailModal";
import { BarberEditModal } from "./components/BarberEditModal";

export default function BerberlerPage() {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      const result = await getBarbers();
      if (result.success && result.data) {
        setBarbers(result.data);
      }
    } catch (error) {
      console.error("Error loading barbers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = (barber: any) => {
    setSelectedBarber(barber);
    setDetailModalOpen(true);
  };

  const handleEditClick = (barber: any) => {
    setSelectedBarber(barber);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadBarbers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Berberler</h1>
          <p className="text-gray-600">Berber yönetimi ve düzenleme</p>
        </div>
        <Link href="/admin/berberler/yeni">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            <u>Yeni Berber</u>
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Berber ara..." className="pl-8" />
        </div>
      </div>

      {/* Berberler Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => (
          <Card key={barber.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={barber.image || ""} />
                    <AvatarFallback>
                      {barber.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{barber.name}</CardTitle>
                  </div>
                </div>
                <ToggleBarberStatus 
                  barberId={barber.id} 
                  isActive={barber.isActive}
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Berber Bilgileri */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{barber.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{barber.slotDuration} dk slot süresi</span>
                </div>
              </div>

              {/* İstatistikler */}
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-center">
                  <p className="text-lg font-semibold">{barber._count.appointments}</p>
                  <p className="text-xs text-gray-500">Toplam Randevu</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDetailClick(barber)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detay
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditClick(barber)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {barbers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz berber yok</h3>
            <p className="text-gray-600 text-center mb-4">
              İlk berberinizi ekleyerek başlayın
            </p>
            <Link href="/admin/berberler/yeni">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Berber Ekle
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {selectedBarber && (
        <>
          <BarberDetailModal
            barber={selectedBarber}
            isOpen={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            onEdit={() => {
              setDetailModalOpen(false);
              setEditModalOpen(true);
            }}
          />
          
          <BarberEditModal
            barber={selectedBarber}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSuccess={handleEditSuccess}
          />
        </>
      )}
    </div>
  );
}
