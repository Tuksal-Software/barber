"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getActiveBarbers } from "@/lib/actions/barber.actions"
import { getLedgerCandidates, upsertLedgerForAppointment } from "@/lib/actions/ledger-v2.actions"
import type { UnpaidLedgerItem, PaidLedgerItem } from "@/lib/actions/ledger-v2.actions"
import { getSessionClient } from "@/lib/actions/auth-client.actions"
import { toast } from "sonner"

interface Barber {
  id: string
  name: string
}

export default function DefterPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [selectedBarber, setSelectedBarber] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [unpaid, setUnpaid] = useState<UnpaidLedgerItem[]>([])
  const [paid, setPaid] = useState<PaidLedgerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState<Record<string, { amount: string; note: string }>>({})

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setSelectedDate(today)
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      loadLedgerData()
    }
  }, [selectedBarber, selectedDate])

  const loadInitialData = async () => {
    try {
      const session = await getSessionClient()
      if (session) {
        setIsAdmin(session.role === "admin")
        if (session.role === "admin") {
          const barbersList = await getActiveBarbers()
          setBarbers(barbersList.map((b) => ({ id: b.id, name: b.name })))
        } else {
          setSelectedBarber(session.userId)
        }
      }
    } catch (error) {
      console.error("Error loading initial data:", error)
    }
  }

  const loadLedgerData = async () => {
    if (!selectedDate) return

    setLoading(true)
    try {
      const result = await getLedgerCandidates({
        barberId: selectedBarber === "all" ? undefined : selectedBarber,
        selectedDate,
      })
      setUnpaid(result.unpaid)
      setPaid(result.paid)

      const initialFormData: Record<string, { amount: string; note: string }> = {}
      result.unpaid.forEach((item) => {
        initialFormData[item.appointmentId] = { amount: "", note: "" }
      })
      setFormData(initialFormData)
    } catch (error) {
      console.error("Error loading ledger data:", error)
      toast.error("Veriler yüklenirken hata oluştu")
      setUnpaid([])
      setPaid([])
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (appointmentId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        amount: value,
      },
    }))
  }

  const handleNoteChange = (appointmentId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        note: value,
      },
    }))
  }

  const handleSave = async (appointmentId: string) => {
    const data = formData[appointmentId]
    if (!data || !data.amount) {
      toast.error("Lütfen ücret girin")
      return
    }

    const amount = parseFloat(data.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Geçerli bir ücret girin")
      return
    }

    setSavingStates((prev) => ({ ...prev, [appointmentId]: true }))

    try {
      const result = await upsertLedgerForAppointment({
        appointmentRequestId: appointmentId,
        amount,
        description: data.note || undefined,
      })

      if (result.success) {
        toast.success("Ücret kaydedildi")
        await loadLedgerData()
      } else {
        toast.error(result.error || "Kayıt sırasında hata oluştu")
      }
    } catch (error) {
      console.error("Error saving ledger:", error)
      toast.error("Kayıt sırasında hata oluştu")
    } finally {
      setSavingStates((prev) => ({ ...prev, [appointmentId]: false }))
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(parseFloat(amount))
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Defter</h1>
        <p className="text-muted-foreground">Geçmiş randevular için ücret girişi</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {isAdmin && (
              <div className="w-full sm:w-[200px]">
                <Label htmlFor="barber-select" className="mb-2 block">
                  Berber
                </Label>
                <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                  <SelectTrigger id="barber-select">
                    <SelectValue placeholder="Tüm Berberler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Berberler</SelectItem>
                    {barbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="w-full sm:w-[200px]">
              <Label htmlFor="date-select" className="mb-2 block">
                Tarih
              </Label>
              <Input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="unpaid" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unpaid">
              Ücret Girilecekler ({unpaid.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Ücreti Girilmişler ({paid.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unpaid" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Ücret Girilecekler</CardTitle>
              </CardHeader>
              <CardContent>
                {unpaid.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Ücret girilecek randevu bulunamadı
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Müşteri</TableHead>
                          {isAdmin && <TableHead>Berber</TableHead>}
                          <TableHead>Tarih</TableHead>
                          <TableHead>Saat</TableHead>
                          <TableHead>Ücret</TableHead>
                          <TableHead>Not</TableHead>
                          <TableHead className="text-right">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unpaid.map((item) => (
                          <TableRow key={item.appointmentId} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{item.customerName}</TableCell>
                            {isAdmin && <TableCell>{item.barberName}</TableCell>}
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>
                              {item.startTime}
                              {item.endTime ? ` - ${item.endTime}` : ""}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData[item.appointmentId]?.amount || ""}
                                onChange={(e) =>
                                  handleAmountChange(item.appointmentId, e.target.value)
                                }
                                className="w-32"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                placeholder="Not (opsiyonel)"
                                value={formData[item.appointmentId]?.note || ""}
                                onChange={(e) =>
                                  handleNoteChange(item.appointmentId, e.target.value)
                                }
                                className="w-48"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => handleSave(item.appointmentId)}
                                disabled={savingStates[item.appointmentId]}
                              >
                                {savingStates[item.appointmentId] ? "Kaydediliyor..." : "Kaydet"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paid" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Ücreti Girilmişler</CardTitle>
              </CardHeader>
              <CardContent>
                {paid.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Ücreti girilmiş randevu bulunamadı
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Müşteri</TableHead>
                          {isAdmin && <TableHead>Berber</TableHead>}
                          <TableHead>Tarih</TableHead>
                          <TableHead>Saat</TableHead>
                          <TableHead>Ücret</TableHead>
                          <TableHead>Not</TableHead>
                          <TableHead>Girilme Zamanı</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paid.map((item) => (
                          <TableRow key={item.appointmentId} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{item.customerName}</TableCell>
                            {isAdmin && <TableCell>{item.barberName}</TableCell>}
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>
                              {item.startTime}
                              {item.endTime ? ` - ${item.endTime}` : ""}
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(item.ledger.amount)}
                            </TableCell>
                            <TableCell>{item.ledger.description || "-"}</TableCell>
                            <TableCell>{formatDateTime(item.ledger.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
