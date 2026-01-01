"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getSystemJobLogs } from "@/lib/actions/system-job-log.actions"
import type { SystemJobLogItem } from "@/lib/actions/system-job-log.actions"
import { toast } from "sonner"
import { CheckCircle2, User, Phone, Clock, Calendar } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale/tr"

export const dynamic = 'force-dynamic'

export default function SystemJobsPage() {
  const [logs, setLogs] = useState<SystemJobLogItem[]>([])
  const [latestJob, setLatestJob] = useState<{ ranAt: Date } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await getSystemJobLogs(50)
      setLatestJob(data.latestJob)
      setLogs(data.jobsWithSms)
    } catch (error) {
      console.error("Error loading system job logs:", error)
      toast.error("Job logları yüklenirken hata oluştu")
      setLatestJob(null)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: tr })
  }

  const formatDateLong = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return format(date, 'dd MMMM yyyy', { locale: tr })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Hatırlatıcı SMS Logları</h1>
        <p className="text-muted-foreground">Randevu hatırlatıcı cron job çalışma logları</p>
      </div>

      {latestJob && (
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Son Hatırlatıcı Çalışması:</span>
              <span className="font-medium text-foreground">{formatDate(latestJob.ranAt)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              Henüz hatırlatıcı SMS gönderilmemiş.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {logs.map((log) => {
            const reminders2hSent = log.meta?.reminders2hSent || 0
            const reminders1hSent = log.meta?.reminders1hSent || 0
            const totalSent = reminders2hSent + reminders1hSent

            return (
              <AccordionItem key={log.id} value={log.id} className="border-none">
                <Card className="border-border">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex flex-1 items-center justify-between gap-4">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="text-sm font-medium text-muted-foreground">
                          {formatDate(log.ranAt)}
                        </div>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          SMS Gönderildi
                        </Badge>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>2 saat SMS: <strong className="text-foreground">{reminders2hSent}</strong></span>
                          <span>1 saat SMS: <strong className="text-foreground">{reminders1hSent}</strong></span>
                          <span>Toplam: <strong className="text-foreground">{totalSent}</strong></span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-6 pb-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Gönderilen SMS'ler</h4>
                        <div className="space-y-2">
                          {log.smsDetails.length === 0 ? (
                            <div className="text-sm text-muted-foreground py-2">
                              SMS detayı bulunamadı
                            </div>
                          ) : (
                            log.smsDetails.map((sms) => (
                              <Card key={sms.id} className="border-border/50 bg-card">
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                      <span className="font-medium text-foreground">{sms.customerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Phone className="h-3.5 w-3.5 shrink-0" />
                                      <span>{sms.customerPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <span className="font-medium">SMS Türü:</span>
                                      <span>
                                        {sms.smsType === '2h' 
                                          ? 'Randevu Hatırlatma (2 Saat Kala)' 
                                          : 'Randevu Hatırlatma (1 Saat Kala)'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                                      <span>
                                        {formatDateLong(sms.appointmentDate)} - {sms.appointmentTime}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Clock className="h-3.5 w-3.5 shrink-0" />
                                      <span>SMS gönderim zamanı: {formatDate(sms.sentAt)}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </div>
  )
}
