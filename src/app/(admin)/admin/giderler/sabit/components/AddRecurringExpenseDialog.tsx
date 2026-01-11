"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HelpCircle } from "lucide-react"
import { createRecurringExpense } from "@/lib/actions/recurring-expense.actions"
import { toast } from "sonner"

interface AddRecurringExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const categoryLabels: Record<string, string> = {
  rent: "Kira",
  electricity: "Elektrik",
  water: "Su",
  product: "Ürün",
  staff: "Personel",
  other: "Diğer",
}

const repeatTypeLabels: Record<string, string> = {
  daily: "Günlük",
  weekly: "Haftalık",
  monthly: "Aylık",
}

export function AddRecurringExpenseDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddRecurringExpenseDialogProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<string>("")
  const [repeatType, setRepeatType] = useState<string>("")
  const [repeatInterval, setRepeatInterval] = useState("1")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !amount || !category || !repeatType || !startDate) {
      toast.error("Lütfen tüm zorunlu alanları doldurun")
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Geçerli bir tutar girin")
      return
    }

    const intervalNum = parseInt(repeatInterval)
    if (isNaN(intervalNum) || intervalNum <= 0) {
      toast.error("Tekrar aralığı 1'den büyük olmalıdır")
      return
    }

    setLoading(true)

    try {
      const result = await createRecurringExpense({
        title,
        amount: amountNum,
        category: category as any,
        repeatType: repeatType as any,
        repeatInterval: intervalNum,
        startDate,
        endDate: endDate || null,
      })

      if (result.success) {
        toast.success("Sabit gider eklendi")
        setTitle("")
        setAmount("")
        setCategory("")
        setRepeatType("")
        setRepeatInterval("1")
        setStartDate("")
        setEndDate("")
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(result.error || "Sabit gider eklenirken hata oluştu")
      }
    } catch (error) {
      console.error("Error creating recurring expense:", error)
      toast.error("Sabit gider eklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-visible max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sabit Gider Ekle</DialogTitle>
          <DialogDescription>
            Belirli aralıklarla otomatik olarak eklenen gider tanımlayın
          </DialogDescription>
        </DialogHeader>
        <form id="recurring-expense-form" onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Örn: Kira"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Tutar (₺) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Kategori *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="z-[100]"
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Label htmlFor="repeatType">Tekrar Türü *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 z-[100]" side="top">
                      <p className="text-sm">
                        Giderin hangi sıklıkta ekleneceğini belirtir (Günlük, Haftalık, Aylık).
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
                <Select value={repeatType} onValueChange={setRepeatType} required>
                  <SelectTrigger id="repeatType">
                    <SelectValue placeholder="Tekrar türü seçin" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    className="z-[100]"
                  >
                    {Object.entries(repeatTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Label htmlFor="repeatInterval">Tekrar Aralığı *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 z-[100]" side="top">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Tekrar Aralığı Nedir?</h4>
                        <p className="text-sm text-muted-foreground">
                          Giderin kaç tekrar biriminde bir ekleneceğini belirtir.
                        </p>
                        <div className="text-sm space-y-1">
                          <p className="font-medium">Örnekler:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                            <li>Tekrar Türü: Aylık, Tekrar Aralığı: 1 → Her ay</li>
                            <li>Tekrar Türü: Aylık, Tekrar Aralığı: 3 → 3 ayda bir</li>
                            <li>Tekrar Türü: Haftalık, Tekrar Aralığı: 2 → 2 haftada bir</li>
                          </ul>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="repeatInterval"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={repeatInterval}
                  onChange={(e) => setRepeatInterval(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Başlangıç Tarihi *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Label htmlFor="endDate">Bitiş Tarihi (Opsiyonel)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 z-[100]" side="top">
                      <p className="text-sm">
                        Bu tarihten sonra gider otomatik olarak eklenmez. Boş bırakılırsa süresiz devam eder.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button form="recurring-expense-form" type="submit" disabled={loading}>
              {loading ? "Ekleniyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
