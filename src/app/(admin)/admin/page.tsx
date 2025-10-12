"use client";

import { useState, useEffect } from "react";
import { getDashboardStats, getBarberPerformance, getRecentAppointments } from "@/lib/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Edit,
  Star
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { EditAppointmentModal } from "./components/EditAppointmentModal";
import { updateAppointmentStatus } from "@/lib/actions/appointment";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResult, performanceResult, appointmentsResult] = await Promise.all([
        getDashboardStats(),
        getBarberPerformance(),
        getRecentAppointments(),
      ]);

      if (statsResult.success) setStats(statsResult.data);
      if (performanceResult.success) setPerformance(performanceResult.data || []);
      if (appointmentsResult.success) setAppointments(appointmentsResult.data || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadDashboardData();
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const result = await updateAppointmentStatus(appointmentId, newStatus as any);
      if (result.success) {
        toast.success("Randevu durumu güncellendi");
        loadDashboardData();
      } else {
        toast.error(result.error || "Güncelleme başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      <EditAppointmentModal
        appointment={selectedAppointment}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
      <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Salon yönetim paneline hoş geldiniz</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Randevular</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.todayVsYesterday && stats.todayVsYesterday !== 0 ? (
                <span className={stats.todayVsYesterday > 0 ? "text-green-600" : "text-red-600"}>
                  {stats.todayVsYesterday > 0 ? (
                    <>
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +{stats.todayVsYesterday} dünden
                    </>
                  ) : (
                    <>
                      <TrendingDown className="inline h-3 w-3 mr-1" />
                      {stats.todayVsYesterday} dünden
                    </>
                  )}
                </span>
              ) : (
                "Değişiklik yok"
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta Toplam</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.weekAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.weekGrowth && stats.weekGrowth !== 0 ? (
                <span className={stats.weekGrowth > 0 ? "text-green-600" : "text-red-600"}>
                  {stats.weekGrowth > 0 ? (
                    <>
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      %{stats.weekGrowth} artış
                    </>
                  ) : (
                    <>
                      <TrendingDown className="inline h-3 w-3 mr-1" />
                      %{Math.abs(stats.weekGrowth)} azalış
                    </>
                  )}
                </span>
              ) : (
                "Geçen hafta ile aynı"
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Randevular</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Onay bekliyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Berberler</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBarbers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Çalışır durumda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barber Performance Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Berber Performansı</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performance?.map((barber) => (
            <Card key={barber.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={barber.image || ""} />
                    <AvatarFallback>
                      {barber.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{barber.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{barber.rating.toString()}</span>
                      <span className="text-sm text-gray-600">• {barber.experience} yıl deneyim</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bugün</span>
                    <span>{barber.todayAppointments}/10 dolu</span>
                  </div>
                  <Progress value={(barber.todayAppointments / 10) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bu Hafta</span>
                    <span>{barber.weekAppointments}/40 dolu</span>
                  </div>
                  <Progress value={(barber.weekAppointments / 40) * 100} className="h-2" />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Doluluk Oranı</span>
                  <Badge 
                    variant={
                      barber.occupancyRate >= 80 ? "destructive" :
                      barber.occupancyRate >= 60 ? "warning" : "success"
                    }
                  >
                    %{barber.occupancyRate}
                  </Badge>
                </div>

                {barber.upcomingAppointments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Yaklaşan Randevular:</p>
                    <div className="space-y-1">
                      {barber.upcomingAppointments.map((apt: any, index: number) => (
                        <div key={index} className="text-xs text-gray-600">
                          {apt.time} - {apt.customer}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Son Randevular</h2>
          <Link href="/admin/randevular">
            <Button variant="outline" size="sm">
              Tümünü Gör
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Berber</TableHead>
                  <TableHead>Tarih & Saat</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments?.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment.customerName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={appointment.barber.image || ""} />
                          <AvatarFallback className="text-xs">
                            {appointment.barber.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{appointment.barber.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(new Date(appointment.date))}</div>
                        <div className="text-gray-500">
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={appointment.status} 
                        onValueChange={(value) => handleStatusChange(appointment.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                          <SelectItem value="pending">Beklemede</SelectItem>
                          <SelectItem value="confirmed">Onaylandı</SelectItem>
                          <SelectItem value="completed">Tamamlandı</SelectItem>
                          <SelectItem value="cancelled">İptal Edildi</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Randevuyu Düzenle"
                          onClick={() => handleEditClick(appointment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}