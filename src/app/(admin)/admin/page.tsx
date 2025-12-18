"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Users, CheckCircle, Clock, Loader2, ArrowRight } from "lucide-react"
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
  pending: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  approved: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  rejected: "bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
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
    completed: 0,
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
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1 md:text-base">Genel bakış</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Bugünkü Randevular"
            value={stats.approvedToday}
            icon={Calendar}
          />
          <StatCard
            title="Bekleyen Randevular"
            value={stats.pending}
            icon={Clock}
          />
          <StatCard
            title="Onaylanan Randevular"
            value={stats.completed}
            icon={CheckCircle}
          />
          <StatCard
            title="Aktif Berber Sayısı"
            value={stats.activeBarbers}
            icon={Users}
          />
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <WeeklyAppointmentsChart data={weeklyData} />
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Randevu Durumları</CardTitle>
            <CardDescription className="text-muted-foreground">
              Onaylanan ve İptal Edilen Randevular
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Onaylanan</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{statusStats.approved}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">İptal Edilen</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{statusStats.cancelled}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
                    <Clock className="h-6 w-6 text-destructive" />
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
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/randevular")}
              className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
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
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Müşteri</TableHead>
                    <TableHead className="text-foreground font-semibold hidden sm:table-cell">Berber</TableHead>
                    <TableHead className="text-foreground font-semibold">Tarih</TableHead>
                    <TableHead className="text-foreground font-semibold hidden md:table-cell">Saat</TableHead>
                    <TableHead className="text-foreground font-semibold">Durum</TableHead>
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
                          <span>{format(parseISO(appointment.date), "d MMM yyyy", { locale: tr })}</span>
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
    </div>
  )
}

