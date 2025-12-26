"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getAuditLogs } from "@/lib/actions/audit.actions"
import type { AuditLogItem } from "@/lib/actions/audit.actions"
import { formatDistanceToNow, format } from "date-fns"
import { tr } from "date-fns/locale/tr"
import { User, Shield, Server, ChevronDown } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    actorType: 'all' as string,
    action: 'all' as string,
    entityType: 'all' as string,
    fromDate: '',
    toDate: '',
    search: '',
  })

  useEffect(() => {
    loadLogs()
  }, [filters])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await getAuditLogs({
        actorType: filters.actorType !== 'all' ? filters.actorType as 'customer' | 'admin' | 'system' : undefined,
        action: filters.action !== 'all' ? filters.action : undefined,
        entityType: filters.entityType !== 'all' ? filters.entityType as 'appointment' | 'ledger' | 'expense' | 'sms' | 'auth' | 'ui' | 'other' : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        search: filters.search || undefined,
        limit: 100,
      })
      setLogs(data)
    } catch (error) {
      console.error("Error loading audit logs:", error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: tr })
  }

  const formatRelativeDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: tr })
  }

  const getActorBadge = (actorType: string) => {
    switch (actorType) {
      case 'admin':
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        )
      case 'customer':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Müşteri
          </Badge>
        )
      case 'system':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Server className="h-3 w-3" />
            Sistem
          </Badge>
        )
      default:
        return <Badge variant="outline">{actorType}</Badge>
    }
  }

  const getActionBadge = (action: string) => {
    if (action.startsWith('APPOINTMENT_')) {
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">{action}</Badge>
    }
    if (action.startsWith('SMS_')) {
      return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">{action}</Badge>
    }
    if (action.startsWith('AUTH_')) {
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">{action}</Badge>
    }
    return <Badge variant="outline">{action}</Badge>
  }

  const formatMetadata = (metadata: any): string => {
    if (!metadata) return 'Yok'
    try {
      return JSON.stringify(metadata, null, 2)
    } catch {
      return String(metadata)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Audit Loglar</h1>
        <p className="text-muted-foreground">Sistemde gerçekleşen tüm işlemler</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Actor Type</label>
              <Select value={filters.actorType} onValueChange={(value) => setFilters({ ...filters, actorType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="customer">Müşteri</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="system">Sistem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="APPOINTMENT_FORM_PHONE_ENTERED">Form: Telefon Girildi</SelectItem>
                  <SelectItem value="APPOINTMENT_FORM_NAME_ENTERED">Form: İsim Girildi</SelectItem>
                  <SelectItem value="APPOINTMENT_FORM_ABANDONED">Form: Terk Edildi</SelectItem>
                  <SelectItem value="APPOINTMENT_CREATED">Randevu Oluşturuldu</SelectItem>
                  <SelectItem value="APPOINTMENT_APPROVED">Randevu Onaylandı</SelectItem>
                  <SelectItem value="APPOINTMENT_CANCELLED">Randevu İptal Edildi</SelectItem>
                  <SelectItem value="SMS_SENT">SMS Gönderildi</SelectItem>
                  <SelectItem value="SMS_FAILED">SMS Başarısız</SelectItem>
                  <SelectItem value="AUTH_LOGIN">Giriş Yapıldı</SelectItem>
                  <SelectItem value="AUTH_LOGOUT">Çıkış Yapıldı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Entity Type</label>
              <Select value={filters.entityType} onValueChange={(value) => setFilters({ ...filters, entityType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="appointment">Randevu</SelectItem>
                  <SelectItem value="ledger">Defter</SelectItem>
                  <SelectItem value="expense">Gider</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="auth">Kimlik Doğrulama</SelectItem>
                  <SelectItem value="ui">Arayüz</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Başlangıç Tarihi</label>
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Bitiş Tarihi</label>
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Arama</label>
              <Input
                placeholder="Özet veya metadata'da ara..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log Kayıtları</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Audit log kaydı bulunamadı
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zaman</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Özet</TableHead>
                    <TableHead>Detay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <>
                      <TableRow key={log.id} className={log.actorType === 'admin' ? 'bg-primary/5' : ''}>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">{formatRelativeDate(log.createdAt)}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getActorBadge(log.actorType)}
                        </TableCell>
                        <TableCell>
                          {getActionBadge(log.action)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.entityType}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <span className="text-sm">{log.summary}</span>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => {
                              const newSet = new Set(expandedLogs)
                              if (expandedLogs.has(log.id)) {
                                newSet.delete(log.id)
                              } else {
                                newSet.add(log.id)
                              }
                              setExpandedLogs(newSet)
                            }}
                            className="text-xs hover:underline flex items-center gap-1"
                          >
                            Detay
                            <ChevronDown className={`h-3 w-3 transition-transform ${expandedLogs.has(log.id) ? 'rotate-180' : ''}`} />
                          </button>
                        </TableCell>
                      </TableRow>
                      {expandedLogs.has(log.id) && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30">
                            <div className="space-y-2 text-xs py-2">
                              <div>
                                <span className="font-medium">Actor ID:</span> {log.actorId || 'Yok'}
                              </div>
                              <div>
                                <span className="font-medium">Entity ID:</span> {log.entityId || 'Yok'}
                              </div>
                              <div>
                                <span className="font-medium">Metadata:</span>
                                <pre className="mt-1 p-2 bg-background rounded text-xs font-mono overflow-x-auto max-h-40 overflow-y-auto border">
                                  {formatMetadata(log.metadata)}
                                </pre>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

