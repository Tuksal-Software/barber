"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Users, CheckCircle, Clock, Loader2, ArrowRight, XCircle, TrendingUp, TrendingDown, DollarSign, Activity, BookOpen, Receipt, Shield, User, Server } from "lucide-react"
import { StatCard } from "@/components/app/StatCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getDashboardStats, getWeeklyAppointments, getAppointmentStatusStats } from "@/lib/actions/stats.actions"
import { getRecentAppointments } from "@/lib/actions/appointment-query.actions"
import { getFinanceSummary } from "@/lib/actions/dashboard-finance.actions"
import { getTodayAuditSummary, getRecentAuditActivities } from "@/lib/actions/audit.actions"
import { format, parseISO, formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale/tr"
import { WeeklyAppointmentsChart } from "@/components/app/WeeklyAppointmentsChart"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardStats, WeeklyAppointmentData, AppointmentStatusStats } from "@/lib/actions/stats.actions"
import type { AppointmentRequestListItem } from "@/lib/actions/appointment-query.actions"
import type { FinanceSummary } from "@/lib/actions/dashboard-finance.actions"
import type { TodayAuditSummary, RecentAuditActivity } from "@/lib/actions/audit.actions"

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
    subscriptionCustomers: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState<AppointmentRequestListItem[]>([])
  const [weeklyData, setWeeklyData] = useState<WeeklyAppointmentData[]>([])
  const [statusStats, setStatusStats] = useState<AppointmentStatusStats>({ approved: 0, cancelled: 0 })
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary>({ totalRevenue: 0, totalExpense: 0, netProfit: 0 })
  const [financeRange, setFinanceRange] = useState<'day' | 'week' | 'month' | 'all'>('all')
  const [financeLoading, setFinanceLoading] = useState(false)
  const [auditSummary, setAuditSummary] = useState<TodayAuditSummary>({
    totalEvents: 0,
    appointmentActions: 0,
    ledgerActions: 0,
    expenseActions: 0,
    smsSent: 0,
    authActions: 0,
  })
  const [recentAuditLogs, setRecentAuditLogs] = useState<RecentAuditActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [statsData, appointmentsData, weeklyData, statusStats, financeData, auditSummaryData, recentAuditData] = await Promise.all([
          getDashboardStats(),
          getRecentAppointments(5),
          getWeeklyAppointments(),
          getAppointmentStatusStats(),
          getFinanceSummary('all'),
          getTodayAuditSummary(),
          getRecentAuditActivities(5),
        ])
        setStats(statsData)
        setRecentAppointments(appointmentsData)
        setWeeklyData(weeklyData)
        setStatusStats(statusStats)
        setFinanceSummary(financeData)
        setAuditSummary(auditSummaryData)
        setRecentAuditLogs(recentAuditData)
      } catch (error) {
        console.error("Dashboard veri yükleme hatası:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchFinance() {
      try {
        setFinanceLoading(true)
        const financeData = await getFinanceSummary(financeRange)
        setFinanceSummary(financeData)
      } catch (error) {
        console.error("Finance veri yükleme hatası:", error)
      } finally {
        setFinanceLoading(false)
      }
    }
    fetchFinance()
  }, [financeRange])

  const handleFinanceRangeChange = (range: 'day' | 'week' | 'month' | 'all') => {
    setFinanceRange(range)
  }

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Abonman Müşteriler
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.subscriptionCustomers}</div>
                  <p className="text-xs text-muted-foreground">
                    Aktif abonman müşteri sayısı
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Bugün Yapılan İşlemler
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{auditSummary.totalEvents}</div>
                  <p className="text-xs text-muted-foreground">
                    Bugünkü toplam aktivite
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Bugün Randevu İşlemleri
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{auditSummary.appointmentActions}</div>
                  <p className="text-xs text-muted-foreground">
                    Randevu ile ilgili işlemler
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Bugün Defter İşlemleri
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{auditSummary.ledgerActions}</div>
                  <p className="text-xs text-muted-foreground">
                    Defter kayıt işlemleri
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Bugün Gider İşlemleri
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{auditSummary.expenseActions}</div>
                  <p className="text-xs text-muted-foreground">
                    Gider kayıt işlemleri
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-foreground">Finansal Özet</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Gelir, gider ve net kâr analizi
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={financeRange === 'day' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFinanceRangeChange('day')}
                    >
                      Günlük
                    </Button>
                    <Button
                      variant={financeRange === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFinanceRangeChange('week')}
                    >
                      Haftalık
                    </Button>
                    <Button
                      variant={financeRange === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFinanceRangeChange('month')}
                    >
                      Aylık
                    </Button>
                    <Button
                      variant={financeRange === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFinanceRangeChange('all')}
                    >
                      Tümü
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {financeLoading ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-card border-border">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4 rounded" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4 rounded" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4 rounded" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-card border-border">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                          Toplam Gelir
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          }).format(financeSummary.totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Randevu ücretleri
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                          Toplam Gider
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          }).format(financeSummary.totalExpense)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Dükkan giderleri
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                          Net Kâr
                        </CardTitle>
                        <DollarSign className={`h-4 w-4 ${financeSummary.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${financeSummary.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          }).format(financeSummary.netProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {financeSummary.netProfit >= 0 ? 'Kâr' : 'Zarar'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
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
                                <span className="text-xs md:hidden">
                                  {appointment.requestedEndTime
                                    ? `${appointment.requestedStartTime} - ${appointment.requestedEndTime}`
                                    : `${appointment.requestedStartTime} (Onay Bekliyor)`}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden md:table-cell">
                              {appointment.requestedEndTime
                                ? `${appointment.requestedStartTime} - ${appointment.requestedEndTime}`
                                : `${appointment.requestedStartTime} (Onay Bekliyor)`}
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Son Sistem Aktiviteleri</CardTitle>
                <CardDescription className="text-muted-foreground">
                  En son gerçekleşen sistem işlemleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentAuditLogs.length > 0 ? (
                  <div className="space-y-2">
                    {recentAuditLogs.map((log) => {
                      const getActorBadge = () => {
                        switch (log.actorType) {
                          case 'admin':
                            return (
                              <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 w-fit">
                                <Shield className="h-3 w-3" />
                                Admin
                              </Badge>
                            )
                          case 'customer':
                            return (
                              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                <User className="h-3 w-3" />
                                Müşteri
                              </Badge>
                            )
                          case 'system':
                            return (
                              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                <Server className="h-3 w-3" />
                                Sistem
                              </Badge>
                            )
                          default:
                            return <Badge variant="outline">{log.actorType}</Badge>
                        }
                      }

                      const getActionBadge = () => {
                        if (log.action.startsWith('APPOINTMENT_')) {
                          return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">{log.action}</Badge>
                        }
                        if (log.action.startsWith('SMS_')) {
                          return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">{log.action}</Badge>
                        }
                        if (log.action.startsWith('AUTH_')) {
                          return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">{log.action}</Badge>
                        }
                        if (log.action.startsWith('LEDGER_')) {
                          return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">{log.action}</Badge>
                        }
                        if (log.action.startsWith('EXPENSE_')) {
                          return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">{log.action}</Badge>
                        }
                        return <Badge variant="outline">{log.action}</Badge>
                      }

                      return (
                        <div key={log.id} className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getActionBadge()}
                              {getActorBadge()}
                            </div>
                            <p className="text-sm text-foreground">{log.summary}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: tr })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Henüz aktivite yok
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
