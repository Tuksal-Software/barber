"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getSmsLogs } from "@/lib/actions/sms-log.actions"
import type { SmsLogItem } from "@/lib/actions/sms-log.actions"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function SmsLogPage() {
  const [logs, setLogs] = useState<SmsLogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await getSmsLogs(50)
      setLogs(data)
    } catch (error) {
      console.error("Error loading SMS logs:", error)
      toast.error("SMS logları yüklenirken hata oluştu")
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">SMS Logları</h1>
        <p className="text-muted-foreground">Gönderilen SMS mesajlarının kayıtları</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SMS Gönderim Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Henüz SMS log kaydı bulunmuyor
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Mesaj</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow 
                      key={log.id}
                      className={log.isAdmin ? "bg-primary/10 hover:bg-primary/15" : ""}
                    >
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.event}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          {log.to}
                          {log.isAdmin && (
                            <Badge variant="secondary" className="text-xs">
                              ADMIN
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.message.length > 50 ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help underline decoration-dotted">
                                  {truncateMessage(log.message)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-md">
                                <p className="whitespace-pre-wrap">{log.message}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span>{log.message}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            Başarılı
                          </Badge>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Hata
                                  </Badge>
                                </span>
                              </TooltipTrigger>
                              {log.error && (
                                <TooltipContent className="max-w-md">
                                  <p className="whitespace-pre-wrap">{log.error}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                    </TableRow>
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

