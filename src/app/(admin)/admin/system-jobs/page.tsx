"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getSystemJobLogs } from "@/lib/actions/system-job-log.actions"
import type { SystemJobLogItem } from "@/lib/actions/system-job-log.actions"
import { toast } from "sonner"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale/tr"

export const dynamic = 'force-dynamic'

export default function SystemJobsPage() {
  const [logs, setLogs] = useState<SystemJobLogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await getSystemJobLogs(50)
      setLogs(data)
    } catch (error) {
      console.error("Error loading system job logs:", error)
      toast.error("Job logları yüklenirken hata oluştu")
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: tr })
  }

  const getStatusBadge = (log: SystemJobLogItem) => {
    if (!log.meta) {
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Bilinmiyor
        </Badge>
      )
    }

    const { reminders2hSent = 0, reminders1hSent = 0, errors = 0 } = log.meta
    const totalSent = reminders2hSent + reminders1hSent

    if (errors > 0) {
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          Hata Var
        </Badge>
      )
    }

    if (totalSent > 0) {
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          SMS Gönderildi
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
        <Clock className="h-3 w-3 mr-1" />
        Çalıştı ama SMS yok
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">System Jobs</h1>
        <p className="text-muted-foreground">Randevu hatırlatıcı cron job çalışma logları</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Çalışma Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Henüz job log kaydı bulunmuyor
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id} className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground">
                            {formatDate(log.ranAt)}
                          </span>
                          {getStatusBadge(log)}
                        </div>
                        
                        {log.meta && (
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {log.meta.reminders2hSent !== undefined && (
                              <span>2 saat SMS: <strong className="text-foreground">{log.meta.reminders2hSent}</strong></span>
                            )}
                            {log.meta.reminders1hSent !== undefined && (
                              <span>1 saat SMS: <strong className="text-foreground">{log.meta.reminders1hSent}</strong></span>
                            )}
                            {log.meta.reminders2hSkipped !== undefined && log.meta.reminders1hSkipped !== undefined && (
                              <span>Duplicate atlanan: <strong className="text-foreground">{log.meta.reminders2hSkipped + log.meta.reminders1hSkipped}</strong></span>
                            )}
                            {log.meta.errors !== undefined && log.meta.errors > 0 && (
                              <span className="text-red-500">Hata: <strong>{log.meta.errors}</strong></span>
                            )}
                            {log.meta.totalApproved !== undefined && (
                              <span>Toplam onaylı: <strong className="text-foreground">{log.meta.totalApproved}</strong></span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

