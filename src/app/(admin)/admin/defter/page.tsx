"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getActiveBarbers } from "@/lib/actions/barber.actions"
import {
  getLedgerCandidates,
  upsertLedgerForAppointment,
  deleteLedgerEntry,
  getLedgerSummary,
} from "@/lib/actions/ledger-v2.actions"
import type { UnpaidLedgerItem, PaidLedgerItem } from "@/lib/actions/ledger-v2.actions"
import { getSessionClient } from "@/lib/actions/auth-client.actions"
import { toast } from "sonner"
import { Edit2, X } from "lucide-react"
import { BarberFilter } from "@/components/admin/BarberFilter"

interface Barber {
  id: string
  name: string
}

export default function DefterPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [unpaid, setUnpaid] = useState<UnpaidLedgerItem[]>([])
  const [paid, setPaid] = useState<PaidLedgerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({})
  const [summary, setSummary] = useState({ totalRevenue: "0", paidCount: 0, unpaidCount: 0 })
  const [recentAmounts, setRecentAmounts] = useState<number[]>([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PaidLedgerItem | null>(null)
  const [editFormData, setEditFormData] = useState({ amount: "", description: "" })
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<{ appointmentId: string; item: UnpaidLedgerItem } | null>(null)

  const [formData, setFormData] = useState<Record<string, { amount: string; description: string }>>({})

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setSelectedDate(today)
    loadInitialData()
  }, [])

  const loadLedgerData = useCallback(async () => {
    setLoading(true)
    try {
      const [result, summaryData] = await Promise.all([
        getLedgerCandidates({
          barberId: selectedBarberId || undefined,
          selectedDate: selectedDate || "",
        }),
        getLedgerSummary({
          barberId: selectedBarberId || undefined,
          selectedDate: selectedDate || "",
        }),
      ])
      setUnpaid(result.unpaid)
      setPaid(result.paid)
      setSummary(summaryData)

      const initialFormData: Record<string, { amount: string; description: string }> = {}
      result.unpaid.forEach((item) => {
        initialFormData[item.appointmentId] = { amount: "", description: "" }
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
  }, [selectedBarberId, selectedDate])

  useEffect(() => {
    loadLedgerData()
  }, [loadLedgerData])

  const loadInitialData = async () => {
    try {
      const session = await getSessionClient()
      if (session) {
        setIsAdmin(session.role === "admin")
        if (session.role === "admin") {
          const barbersList = await getActiveBarbers()
          setBarbers(barbersList.map((b) => ({ id: b.id, name: b.name })))
        } else {
          setSelectedBarberId(session.userId)
        }
      }
    } catch (error) {
      console.error("Error loading initial data:", error)
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

  const handleDescriptionChange = (appointmentId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        description: value,
      },
    }))
  }

  const handleQuickAmount = (appointmentId: string, amount: number) => {
    setFormData((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId] || { amount: "", description: "" },
        amount: amount.toString(),
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

    if (savingStates[appointmentId]) {
      return
    }

    const item = unpaid.find((i) => i.appointmentId === appointmentId)
    if (!item) return

    setSavingStates((prev) => ({ ...prev, [appointmentId]: true }))

    const optimisticPaidItem: PaidLedgerItem = {
      ...item,
      ledger: {
        id: `temp-${appointmentId}`,
        amount: amount.toString(),
        description: data.description || null,
        createdAt: new Date(),
      },
    }

    setUnpaid((prev) => prev.filter((i) => i.appointmentId !== appointmentId))
    setPaid((prev) => [optimisticPaidItem, ...prev])
    setSummary((prev) => ({
      ...prev,
      paidCount: prev.paidCount + 1,
      unpaidCount: prev.unpaidCount - 1,
      totalRevenue: (parseFloat(prev.totalRevenue) + amount).toFixed(2),
    }))

    lastSavedRef.current = { appointmentId, item }

    try {
      const result = await upsertLedgerForAppointment({
        appointmentRequestId: appointmentId,
        amount,
        description: data.description || undefined,
      })

      if (result.success) {
        const newAmounts = [...recentAmounts.filter((a) => a !== amount), amount].slice(-5)
        setRecentAmounts(newAmounts)

        const undoToast = toast.success("Ücret kaydedildi", {
          action: {
            label: "Geri Al (5sn)",
            onClick: () => handleUndo(appointmentId),
          },
          duration: 5000,
        })

        undoTimeoutRef.current = setTimeout(() => {
          lastSavedRef.current = null
        }, 5000)

        await loadLedgerData()
      } else {
        setUnpaid((prev) => [...prev, item])
        setPaid((prev) => prev.filter((i) => i.appointmentId !== appointmentId))
        setSummary((prev) => ({
          ...prev,
          paidCount: prev.paidCount - 1,
          unpaidCount: prev.unpaidCount + 1,
          totalRevenue: (parseFloat(prev.totalRevenue) - amount).toFixed(2),
        }))
        toast.error(result.error || "Kayıt sırasında hata oluştu")
      }
    } catch (error) {
      setUnpaid((prev) => [...prev, item])
      setPaid((prev) => prev.filter((i) => i.appointmentId !== appointmentId))
      setSummary((prev) => ({
        ...prev,
        paidCount: prev.paidCount - 1,
        unpaidCount: prev.unpaidCount + 1,
        totalRevenue: (parseFloat(prev.totalRevenue) - amount).toFixed(2),
      }))
      console.error("Error saving ledger:", error)
      toast.error("Kayıt sırasında hata oluştu")
    } finally {
      setSavingStates((prev) => ({ ...prev, [appointmentId]: false }))
    }
  }

  const handleUndo = async (appointmentId: string) => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
      undoTimeoutRef.current = null
    }

    const saved = lastSavedRef.current
    if (!saved || saved.appointmentId !== appointmentId) return

    try {
      const result = await deleteLedgerEntry(appointmentId)
      if (result.success) {
        setUnpaid((prev) => [...prev, saved.item])
        setPaid((prev) => prev.filter((i) => i.appointmentId !== appointmentId))
        const amount = parseFloat(paid.find((p) => p.appointmentId === appointmentId)?.ledger.amount || "0")
        setSummary((prev) => ({
          ...prev,
          paidCount: prev.paidCount - 1,
          unpaidCount: prev.unpaidCount + 1,
          totalRevenue: (parseFloat(prev.totalRevenue) - amount).toFixed(2),
        }))
        toast.success("İşlem geri alındı")
        lastSavedRef.current = null
      } else {
        toast.error(result.error || "Geri alma başarısız")
      }
    } catch (error) {
      console.error("Error undoing:", error)
      toast.error("Geri alma sırasında hata oluştu")
    }
  }

  const handleEdit = (item: PaidLedgerItem) => {
    setEditingItem(item)
    setEditFormData({
      amount: item.ledger.amount,
      description: item.ledger.description || "",
    })
    setEditDialogOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingItem) return

    const amount = parseFloat(editFormData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Geçerli bir ücret girin")
      return
    }

    const oldAmount = parseFloat(editingItem.ledger.amount)
    const amountDiff = amount - oldAmount

    setPaid((prev) =>
      prev.map((item) =>
        item.appointmentId === editingItem.appointmentId
          ? {
              ...item,
              ledger: {
                ...item.ledger,
                amount: amount.toString(),
                description: editFormData.description || null,
              },
            }
          : item
      )
    )
    setSummary((prev) => ({
      ...prev,
      totalRevenue: (parseFloat(prev.totalRevenue) + amountDiff).toFixed(2),
    }))

    try {
      const result = await upsertLedgerForAppointment({
        appointmentRequestId: editingItem.appointmentId,
        amount,
        description: editFormData.description || undefined,
      })

      if (result.success) {
        toast.success("Güncelleme başarılı")
        setEditDialogOpen(false)
        setEditingItem(null)
      } else {
        setPaid((prev) =>
          prev.map((item) =>
            item.appointmentId === editingItem.appointmentId ? editingItem : item
          )
        )
        setSummary((prev) => ({
          ...prev,
          totalRevenue: (parseFloat(prev.totalRevenue) - amountDiff).toFixed(2),
        }))
        toast.error(result.error || "Güncelleme başarısız")
      }
    } catch (error) {
      setPaid((prev) =>
        prev.map((item) =>
          item.appointmentId === editingItem.appointmentId ? editingItem : item
        )
      )
      setSummary((prev) => ({
        ...prev,
        totalRevenue: (parseFloat(prev.totalRevenue) - amountDiff).toFixed(2),
      }))
      console.error("Error updating ledger:", error)
      toast.error("Güncelleme sırasında hata oluştu")
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

  const truncateText = (text: string | null, maxLength: number = 30) => {
    if (!text) return "-"
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  const totalRevenue = paid.reduce(
    (sum, item) => sum + parseFloat(item.ledger.amount),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Defter</h1>
        <p className="text-muted-foreground">Geçmiş randevular için ücret girişi</p>
      </div>

      <Card className="sticky top-4 z-10 bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Seçili Tarih</Label>
                <p className="font-medium">{formatDate(selectedDate)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Toplam Ciro</Label>
                <p className="font-semibold text-lg">{formatCurrency(summary.totalRevenue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                Ücreti Girilen: {summary.paidCount}
              </Badge>
              <Badge variant="outline">
                Girilmemiş: {summary.unpaidCount}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {isAdmin && (
              <div className="w-full">
                <Label className="mb-2 block">Berber</Label>
                <BarberFilter
                  barbers={barbers}
                  selectedBarberId={selectedBarberId}
                  onBarberChange={setSelectedBarberId}
                  showLabel={false}
                />
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
                              <div className="space-y-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={formData[item.appointmentId]?.amount || ""}
                                  onChange={(e) =>
                                    handleAmountChange(item.appointmentId, e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSave(item.appointmentId)
                                    }
                                  }}
                                  className="w-32"
                                />
                                {recentAmounts.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {recentAmounts.map((amount) => (
                                      <Badge
                                        key={amount}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-muted"
                                        onClick={() => handleQuickAmount(item.appointmentId, amount)}
                                      >
                                        {amount}₺
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                placeholder="Not (opsiyonel)"
                                value={formData[item.appointmentId]?.description || ""}
                                onChange={(e) =>
                                  handleDescriptionChange(item.appointmentId, e.target.value)
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
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="paid-list">
                      <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>
                            Toplam Ciro: {formatCurrency(totalRevenue.toFixed(2))} • {paid.length} Kayıt
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Müşteri</TableHead>
                                {isAdmin && <TableHead>Berber</TableHead>}
                                <TableHead>Saat</TableHead>
                                <TableHead>Ücret</TableHead>
                                <TableHead>Not</TableHead>
                                <TableHead className="text-right">İşlem</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paid.map((item) => (
                                <TableRow key={item.appointmentId} className="hover:bg-muted/50">
                                  <TableCell className="font-medium">{item.customerName}</TableCell>
                                  {isAdmin && <TableCell>{item.barberName}</TableCell>}
                                  <TableCell>
                                    {item.startTime}
                                    {item.endTime ? ` - ${item.endTime}` : ""}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {formatCurrency(item.ledger.amount)}
                                  </TableCell>
                                  <TableCell>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="cursor-help">
                                            {truncateText(item.ledger.description)}
                                          </span>
                                        </TooltipTrigger>
                                        {item.ledger.description && item.ledger.description.length > 30 && (
                                          <TooltipContent>
                                            <p>{item.ledger.description}</p>
                                          </TooltipContent>
                                        )}
                                      </Tooltip>
                                    </TooltipProvider>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(item)}
                                    >
                                      <Edit2 className="h-4 w-4 mr-1" />
                                      Düzenle
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEditDialogOpen(false)
          }
        }}>
          <DialogHeader>
            <DialogTitle>Ücret Düzenle</DialogTitle>
            <DialogDescription>
              {editingItem?.customerName} - {editingItem?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-amount">Ücret</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0"
                value={editFormData.amount}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Not</Label>
              <Input
                id="edit-description"
                type="text"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleEditSave}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
