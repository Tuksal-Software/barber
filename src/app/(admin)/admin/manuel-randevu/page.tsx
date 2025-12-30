"use client"

import { useState, useEffect, useTransition } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2, Scissors } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimeRangePicker } from "@/components/app/TimeRangePicker"
import { HorizontalDatePicker } from "@/components/app/HorizontalDatePicker"
import { getActiveBarbers } from "@/lib/actions/barber.actions"
import { getCustomerTimeButtonsV2 } from "@/lib/actions/availability.actions"
import { createAdminAppointment, getCustomerByPhone } from "@/lib/actions/appointment.actions"
import { cn } from "@/lib/utils"
import type { BarberListItem } from "@/lib/actions/barber.actions"
import type { CustomerTimeButton } from "@/lib/actions/availability.actions"

const formSchema = z.object({
  customerName: z.string().min(2, "En az 2 karakter olmalı"),
  customerPhone: z.string().regex(/^\+90[5][0-9]{9}$/, "Geçerli bir telefon numarası girin"),
})

type FormData = z.infer<typeof formSchema>

export default function ManuelRandevuPage() {
  const [barbers, setBarbers] = useState<BarberListItem[]>([])
  const [loadingBarbers, setLoadingBarbers] = useState(true)
  const [selectedBarberId, setSelectedBarberId] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedStart, setSelectedStart] = useState<string>("")
  const [selectedDuration, setSelectedDuration] = useState<30 | 60>(30)
  const [timeButtons, setTimeButtons] = useState<CustomerTimeButton[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [phoneValue, setPhoneValue] = useState("")
  const [loadingCustomer, setLoadingCustomer] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const formData = watch()

  const normalizePhone = (value: string): string => {
    const digits = value.replace(/\D/g, "")
    
    if (digits.length === 0) return ""
    
    if (digits.startsWith("90") && digits.length >= 12) {
      return `+${digits.slice(0, 12)}`
    }
    
    if (digits.startsWith("0") && digits.length >= 11) {
      return `+90${digits.slice(1, 12)}`
    }
    
    if (digits.startsWith("5") && digits.length >= 10) {
      return `+90${digits.slice(0, 10)}`
    }
    
    if (digits.length > 0) {
      if (digits.startsWith("90")) {
        return `+${digits.slice(0, 12)}`
      }
      if (digits.startsWith("0")) {
        return `+90${digits.slice(1, 12)}`
      }
      if (digits.startsWith("5")) {
        return `+90${digits.slice(0, 10)}`
      }
      return `+90${digits.slice(0, 10)}`
    }
    
    return ""
  }

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const normalized = normalizePhone(rawValue)
    
    if (normalized.length <= 13) {
      setPhoneValue(normalized)
      setValue("customerPhone", normalized, { shouldValidate: false })
      
      if (normalized.match(/^\+90[5][0-9]{9}$/)) {
        setLoadingCustomer(true)
        try {
          const customer = await getCustomerByPhone(normalized)
          if (customer) {
            setValue("customerName", customer.customerName)
          } else {
            setValue("customerName", "")
          }
        } catch (error) {
          console.error("Error fetching customer:", error)
        } finally {
          setLoadingCustomer(false)
        }
      }
    }
  }

  useEffect(() => {
    async function fetchBarbers() {
      try {
        setLoadingBarbers(true)
        const data = await getActiveBarbers()
        setBarbers(data)
        if (data.length > 0) {
          setSelectedBarberId(data[0].id)
        }
      } catch (error) {
        toast.error("Berberler yüklenirken hata oluştu")
      } finally {
        setLoadingBarbers(false)
      }
    }
    fetchBarbers()
  }, [])

  useEffect(() => {
    if (!selectedBarberId || !selectedDate) {
      setTimeButtons([])
      setSelectedStart("")
      return
    }

    async function fetchTimeButtons() {
      try {
        setLoadingSlots(true)
        const dateStr = format(selectedDate!, "yyyy-MM-dd")
        const buttons = await getCustomerTimeButtonsV2({
          barberId: selectedBarberId,
          date: dateStr,
          durationMinutes: selectedDuration || 30,
        })
        setTimeButtons(buttons)
        setSelectedStart("")
      } catch (error) {
        toast.error("Müsait saatler yüklenirken hata oluştu")
        setTimeButtons([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchTimeButtons()
  }, [selectedBarberId, selectedDate])

  const onSubmit = handleSubmit((data) => {
    if (!selectedBarberId || !selectedDate || !selectedStart || !selectedDuration) {
      toast.error("Lütfen tüm alanları doldurun")
      return
    }

    startTransition(async () => {
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        await createAdminAppointment({
          barberId: selectedBarberId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          date: dateStr,
          requestedStartTime: selectedStart,
          durationMinutes: selectedDuration,
        })
        toast.success("Randevu oluşturuldu")
        reset()
        setPhoneValue("")
        setSelectedDate(new Date())
        setSelectedStart("")
        setSelectedDuration(30)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Randevu oluşturulurken hata oluştu")
      }
    })
  })

  const canSubmit = 
    selectedBarberId &&
    selectedDate &&
    selectedStart &&
    selectedDuration &&
    formData.customerName &&
    formData.customerName.length >= 2 &&
    formData.customerPhone &&
    /^\+90[5][0-9]{9}$/.test(formData.customerPhone) &&
    !isPending

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Manuel Randevu</h1>
        <p className="text-muted-foreground">
          Yeni randevu oluşturmak için aşağıdaki formu doldurun.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Berber Seçimi</CardTitle>
            <CardDescription>Randevu için berber seçin</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBarbers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : barbers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aktif berber bulunamadı</p>
            ) : (
              <div className="space-y-3">
                {barbers.map((barber) => (
                  <Card
                    key={barber.id}
                    className={cn(
                      "cursor-pointer transition-all hover:bg-muted/50",
                      selectedBarberId === barber.id &&
                        "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedBarberId(barber.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback>
                            {barber.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{barber.name}</h3>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Scissors className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarih Seçimi</CardTitle>
            <CardDescription>Randevu tarihini seçin</CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalDatePicker
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Süre Seçimi</CardTitle>
            <CardDescription>Randevu süresini seçin</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(value === "30" ? 30 : 60)}>
              <SelectTrigger>
                <SelectValue placeholder="Süre seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 dakika</SelectItem>
                <SelectItem value="60">60 dakika</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saat Seçimi</CardTitle>
            <CardDescription>Müsait saatleri seçin</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedBarberId || !selectedDate ? (
              <p className="text-sm text-muted-foreground">
                Önce berber ve tarih seçin
              </p>
            ) : loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : timeButtons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bu tarih için müsait saat bulunmamaktadır
              </p>
            ) : (
              <>
                <TimeRangePicker
                  selectedStart={selectedStart}
                  onStartSelect={setSelectedStart}
                  timeButtons={timeButtons}
                />
                {selectedStart && (
                  <div className="mt-4 rounded-lg bg-primary/10 border border-primary/20 p-3">
                    <p className="text-sm font-medium text-primary">
                      Seçilen saat: {selectedStart}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Müşteri Bilgileri</CardTitle>
            <CardDescription>Müşteri adı ve telefon numarası</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerPhone">Telefon *</Label>
              <div className="relative">
                <Input
                  id="customerPhone"
                  type="tel"
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  placeholder="5xxxxxxxxx"
                  maxLength={13}
                  className={cn(
                    errors.customerPhone && "border-destructive"
                  )}
                />
                {loadingCustomer && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {errors.customerPhone && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.customerPhone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="customerName">Ad Soyad *</Label>
              <Input
                id="customerName"
                {...register("customerName")}
                className={cn(
                  errors.customerName && "border-destructive"
                )}
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.customerName.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={!canSubmit}
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              "Randevu Oluştur"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

