"use client"

import React, { useState, useEffect } from "react"
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

  const getActionLabel = (action: string): string => {
    const actionMap: Record<string, string> = {
      UI_PHONE_ENTERED: 'Telefon Numarası Girildi',
      UI_NAME_ENTERED: 'İsim Girildi',
      UI_CANCEL_ATTEMPT: 'İptal Denemesi',
      UI_FORM_ABANDONED: 'Form Terk Edildi',
      UI_SETTINGS_SAVED: 'Ayar Kaydedildi',
      APPOINTMENT_CREATE_ATTEMPT: 'Randevu Oluşturma Denemesi',
      APPOINTMENT_CREATED: 'Randevu Oluşturuldu',
      APPOINTMENT_APPROVED: 'Randevu Onaylandı',
      APPOINTMENT_CANCELLED: 'Randevu İptal Edildi',
      APPOINTMENT_CANCEL_ATTEMPT: 'Randevu İptal Denemesi',
      APPOINTMENT_CANCEL_BLOCKED_PAST: 'Geçmiş Randevu İptali Engellendi',
      APPOINTMENT_CANCEL_DENIED: 'Randevu İptali Reddedildi',
      CUSTOMER_CANCEL_PHONE_ENTERED: 'Müşteri İptal Telefon Girildi',
      CUSTOMER_CANCEL_OTP_SENT: 'Müşteri İptal OTP Gönderildi',
      CUSTOMER_CANCEL_CONFIRMED: 'Müşteri İptali Onaylandı',
      CUSTOMER_CANCEL_FAILED: 'Müşteri İptali Başarısız',
      SETTINGS_CREATED: 'Ayar Oluşturuldu',
      SETTINGS_UPDATED: 'Ayarlar Güncellendi',
      LEDGER_CREATED: 'Defter Kaydı Oluşturuldu',
      LEDGER_UPDATED: 'Defter Kaydı Güncellendi',
      LEDGER_DELETED: 'Defter Kaydı Silindi',
      EXPENSE_CREATED: 'Gider Oluşturuldu',
      EXPENSE_UPDATED: 'Gider Güncellendi',
      EXPENSE_DELETED: 'Gider Silindi',
      SMS_SENT: 'SMS Gönderildi',
      SMS_FAILED: 'SMS Başarısız',
      WORKING_HOUR_UPDATED: 'Çalışma Saati Güncellendi',
      WORKING_HOUR_OVERRIDE_CREATED: 'Çalışma Saati İstisnası Oluşturuldu',
      WORKING_HOUR_OVERRIDE_DELETED: 'Çalışma Saati İstisnası Silindi',
      WORKING_HOUR_OVERRIDE_APPLIED: 'Çalışma Saati İstisnası Uygulandı',
      APPOINTMENT_CANCELLED_BY_OVERRIDE: 'Randevu İstisna Nedeniyle İptal Edildi',
      SUBSCRIPTION_CREATED: 'Abonelik Oluşturuldu',
      SUBSCRIPTION_UPDATED: 'Abonelik Güncellendi',
      SUBSCRIPTION_CANCELLED: 'Abonelik İptal Edildi',
      SUBSCRIPTION_APPOINTMENTS_GENERATED: 'Abonelik Randevuları Oluşturuldu',
      SUBSCRIPTION_APPOINTMENT_CANCELLED: 'Abonelik Randevusu İptal Edildi',
      SUBSCRIPTION_CANCEL_BLOCKED: 'Abonelik İptali Engellendi',
      ADMIN_APPOINTMENT_CREATED: 'Yönetici Randevu Oluşturdu',
      AUTH_LOGIN: 'Yönetici Giriş Yaptı',
      AUTH_LOGOUT: 'Yönetici Çıkış Yaptı',
    }
    return actionMap[action] || action
  }

  const getEntityLabel = (entityType: string): string => {
    const entityMap: Record<string, string> = {
      appointment: 'Randevu',
      ledger: 'Defter',
      expense: 'Gider',
      sms: 'SMS',
      auth: 'Kimlik Doğrulama',
      ui: 'Arayüz',
      settings: 'Ayarlar',
      other: 'Diğer',
    }
    return entityMap[entityType] || entityType
  }

  const formatDate = (date: Date) => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${day} ${month} ${year} ${hours}:${minutes}`
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
            Yönetici
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
    const label = getActionLabel(action)
    if (action.startsWith('APPOINTMENT_')) {
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">{label}</Badge>
    }
    if (action.startsWith('SMS_')) {
      return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">{label}</Badge>
    }
    if (action.startsWith('AUTH_') || action.startsWith('UI_') || action.startsWith('CUSTOMER_CANCEL_')) {
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">{label}</Badge>
    }
    if (action.startsWith('SETTINGS_') || action.startsWith('WORKING_HOUR_') || action.startsWith('SUBSCRIPTION_')) {
      return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">{label}</Badge>
    }
    if (action.startsWith('LEDGER_') || action.startsWith('EXPENSE_')) {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{label}</Badge>
    }
    return <Badge variant="outline">{label}</Badge>
  }

  const formatMetadata = (metadata: any): React.ReactElement[] => {
    if (!metadata) return []
    try {
      const items: React.ReactElement[] = []
      const processValue = (key: string, value: any): string => {
        if (value === null) return '-'
        if (value === undefined) return '-'
        if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır'
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
      }
      const processObject = (obj: any, prefix = '') => {
        Object.keys(obj).forEach((key) => {
          const value = obj[key]
          const fullKey = prefix ? `${prefix}.${key}` : key
          if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0) {
            processObject(value, fullKey)
          } else {
            items.push(
              <div key={fullKey} className="flex gap-2">
                <span className="font-medium text-foreground">{fullKey}:</span>
                <span className="text-muted-foreground">{processValue(fullKey, value)}</span>
              </div>
            )
          }
        })
      }
      processObject(metadata)
      return items
    } catch {
      return [<div key="error" className="text-muted-foreground">{String(metadata)}</div>]
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Denetim Kayıtları</h1>
        <p className="text-muted-foreground">Sistem genelinde gerçekleşen tüm işlemleri burada görüntüleyebilirsiniz.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">İşlemi Yapan</label>
              <Select value={filters.actorType} onValueChange={(value) => setFilters({ ...filters, actorType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="customer">Müşteri</SelectItem>
                  <SelectItem value="admin">Yönetici</SelectItem>
                  <SelectItem value="system">Sistem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">İşlem Türü</label>
              <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="UI_PHONE_ENTERED">Telefon Numarası Girildi</SelectItem>
                  <SelectItem value="UI_NAME_ENTERED">İsim Girildi</SelectItem>
                  <SelectItem value="UI_FORM_ABANDONED">Form Terk Edildi</SelectItem>
                  <SelectItem value="APPOINTMENT_CREATED">Randevu Oluşturuldu</SelectItem>
                  <SelectItem value="APPOINTMENT_APPROVED">Randevu Onaylandı</SelectItem>
                  <SelectItem value="APPOINTMENT_CANCELLED">Randevu İptal Edildi</SelectItem>
                  <SelectItem value="SMS_SENT">SMS Gönderildi</SelectItem>
                  <SelectItem value="SMS_FAILED">SMS Başarısız</SelectItem>
                  <SelectItem value="AUTH_LOGIN">Yönetici Giriş Yaptı</SelectItem>
                  <SelectItem value="AUTH_LOGOUT">Yönetici Çıkış Yaptı</SelectItem>
                  <SelectItem value="SETTINGS_UPDATED">Ayarlar Güncellendi</SelectItem>
                  <SelectItem value="ADMIN_APPOINTMENT_CREATED">Yönetici Randevu Oluşturdu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Etkilenen Alan</label>
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
                  <SelectItem value="settings">Ayarlar</SelectItem>
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
                placeholder="Özet veya detaylarda ara..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Denetim Kayıtları</CardTitle>
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
              Denetim kaydı bulunamadı
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zaman</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>İşlem</TableHead>
                    <TableHead>Alan</TableHead>
                    <TableHead>Açıklama</TableHead>
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
                          <Badge variant="outline">{getEntityLabel(log.entityType)}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <span className="text-sm">{getActionLabel(log.action)}</span>
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
                              <div className="flex gap-2">
                                <span className="font-medium text-foreground">Kullanıcı ID:</span>
                                <span className="text-muted-foreground">{log.actorId || '-'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-medium text-foreground">Alan ID:</span>
                                <span className="text-muted-foreground">{log.entityId || '-'}</span>
                              </div>
                              {log.metadata && (
                                <div className="space-y-1 pt-1 border-t">
                                  <span className="font-medium text-foreground block mb-1">Detaylar:</span>
                                  <div className="space-y-1">
                                    {formatMetadata(log.metadata)}
                                  </div>
                                </div>
                              )}
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

