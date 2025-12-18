"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Users, CheckCircle, Clock, Loader2, ArrowRight, XCircle } from "lucide-react"
import { StatCard } from "@/components/app/StatCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getDashboardStats, getWeeklyAppointments, getAppointmentStatusStats } from "@/lib/actions/stats.actions"
import { getRecentAppointments } from "@/lib/actions/appointment-query.actions"
import { format, parseISO } from "date-fns"
import { tr } from "date-fns/locale/tr"
import { WeeklyAppointmentsChart } from "@/components/app/WeeklyAppointmentsChart"
import type { DashboardStats, WeeklyAppointmentData, AppointmentStatusStats } from "@/lib/actions/stats.actions"
import type { AppointmentRequestListItem } from "@/lib/actions/appointment-query.actions"

const statusColors = {
  pending: "bg-amber-950 text-amber-300 border-amber-800",
  approved: "bg-blue-950 text-blue-300 border-blue-800",
  rejected: "bg-red-950 text-red-300 border-red-800",
  cancelled: "bg-muted text-muted-foreground border-border",
}

const statusLabels = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  cancelled: "İptal",
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    pending: 0,
    approvedToday: 0,
    approvedTotal: 0,
    activeBarbers: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState<AppointmentRequestListItem[]>([])
  const [weeklyData, setWeeklyData] = useState<WeeklyAppointmentData[]>([])
  const [statusStats, setStatusStats] = useState<AppointmentStatusStats>({ approved: 0, cancelled: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [statsData, appointmentsData, weeklyData, statusStats] = await Promise.all([
          getDashboardStats(),
          getRecentAppointments(5),
          getWeeklyAppointments(),
          getAppointmentStatusStats(),
        ])
        setStats(statsData)
        setRecentAppointments(appointmentsData)
        setWeeklyData(weeklyData)
        setStatusStats(statusStats)
      } catch (error) {
        console.error("Dashboard veri yükleme hatası:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            Randevu sisteminizin genel bakışı
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Bugünkü Randevular
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.approvedToday}</div>
                  <p className="text-xs text-muted-foreground">
                    Bugün onaylanan randevular
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Bekleyen Randevular
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">
                    Onay bekleyen randevular
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Onaylanan Randevular
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.approvedTotal}</div>
                  <p className="text-xs text-muted-foreground">
                    Toplam onaylanan randevu
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Aktif Berberler
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.activeBarbers}</div>
                  <p className="text-xs text-muted-foreground">
                    Sistemdeki aktif berber sayısı
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <WeeklyAppointmentsChart data={weeklyData} />
              </div>
              <Card className="col-span-4 md:col-span-2 lg:col-span-3 bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Randevu Durumları</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Onaylanan ve İptal Edilen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">Onaylanan</p>
                          <p className="text-2xl font-bold text-foreground">{statusStats.approved}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                          <CheckCircle className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">İptal Edilen</p>
                          <p className="text-2xl font-bold text-foreground">{statusStats.cancelled}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
                          <XCircle className="h-6 w-6 text-destructive" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-foreground">Son Randevular</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      En son oluşturulan 5 randevu
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/admin/randevular")}
                    className="w-full sm:w-auto"
                  >
                    Tümünü Gör
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentAppointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                          <TableHead className="text-foreground">Müşteri</TableHead>
                          <TableHead className="text-foreground hidden sm:table-cell">Berber</TableHead>
                          <TableHead className="text-foreground">Tarih</TableHead>
                          <TableHead className="text-foreground hidden md:table-cell">Saat</TableHead>
                          <TableHead className="text-foreground">Durum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentAppointments.map((appointment) => (
                          <TableRow
                            key={appointment.id}
                            className="border-border hover:bg-muted/50 cursor-pointer"
                            onClick={() => router.push("/admin/randevular")}
                          >
                            <TableCell className="font-medium text-foreground">
                              <div className="flex flex-col">
                                <span>{appointment.customerName}</span>
                                <span className="text-xs text-muted-foreground sm:hidden">{appointment.barberName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden sm:table-cell">
                              {appointment.barberName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="flex flex-col">
                                <span>{typeof appointment.date === 'string' ? format(new Date(appointment.date + 'T00:00:00'), "d MMM yyyy", { locale: tr }) : format(appointment.date, "d MMM yyyy", { locale: tr })}</span>
                                <span className="text-xs md:hidden">{appointment.requestedStartTime} - {appointment.requestedEndTime}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden md:table-cell">
                              {appointment.requestedStartTime} - {appointment.requestedEndTime}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`font-semibold border-2 ${statusColors[appointment.status] || statusColors.pending}`}
                              >
                                {statusLabels[appointment.status] || statusLabels.pending}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Henüz randevu yok
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
