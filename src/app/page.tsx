"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Star, Scissors, Loader2, Clock, CheckCircle2, Info } from "lucide-react"
import { AppHeader } from "@/components/app/AppHeader"
import { BottomBar } from "@/components/app/BottomBar"
import { Stepper } from "@/components/app/Stepper"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { TimeRangePicker } from "@/components/app/TimeRangePicker"
import { EmptyState } from "@/components/app/EmptyState"
import { getActiveBarbers } from "@/lib/actions/barber.actions"
import { getAvailableTimeSlots, getBlockedSlots, getBookedTimeSlots } from "@/lib/actions/availability.actions"
import { createAppointmentRequest } from "@/lib/actions/appointment.actions"
import { cn } from "@/lib/utils"
import type { BarberListItem } from "@/lib/actions/barber.actions"
import type { AvailableTimeSlot } from "@/lib/actions/availability.actions"

const wizardSteps = [
  { label: "Berber" },
  { label: "Tarih & Saat" },
  { label: "Bilgiler" },
  { label: "Onay" },
]

const formSchema = z.object({
  customerName: z.string().min(2, "En az 2 karakter olmalı"),
  customerPhone: z.string().min(10, "En az 10 karakter olmalı"),
  customerEmail: z.string().email("Geçerli bir e-posta adresi girin").optional().or(z.literal("")),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [barbers, setBarbers] = useState<BarberListItem[]>([])
  const [loadingBarbers, setLoadingBarbers] = useState(true)
  const [selectedBarber, setSelectedBarber] = useState<BarberListItem | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedStartTime, setSelectedStartTime] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([])
  const [blockedSlots, setBlockedSlots] = useState<Array<{ startTime: string; endTime: string }>>([])
  const [bookedRequests, setBookedRequests] = useState<Array<{ startTime: string }>>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const formData = watch()

  useEffect(() => {
    async function fetchBarbers() {
      try {
        setLoadingBarbers(true)
        const data = await getActiveBarbers()
        setBarbers(data)
      } catch (error) {
        toast.error("Berberler yüklenirken hata oluştu")
      } finally {
        setLoadingBarbers(false)
      }
    }
    fetchBarbers()
  }, [])

  useEffect(() => {
    if (!selectedBarber || !selectedDate) {
      setAvailableSlots([])
      setSelectedStartTime("")
      return
    }

    async function fetchSlots() {
      try {
        setLoadingSlots(true)
        const dateStr = format(selectedDate!, "yyyy-MM-dd")
        const [slots, blocked, booked] = await Promise.all([
          getAvailableTimeSlots({
            barberId: selectedBarber!.id,
            date: dateStr,
          }),
          getBlockedSlots({
            barberId: selectedBarber!.id,
            date: dateStr,
          }),
          getBookedTimeSlots({
            barberId: selectedBarber!.id,
            date: dateStr,
          }),
        ])
        setAvailableSlots(slots)
        setBlockedSlots(blocked)
        setBookedRequests(booked)
        setSelectedStartTime("")
      } catch (error) {
        toast.error("Müsait saatler yüklenirken hata oluştu")
        setAvailableSlots([])
        setBlockedSlots([])
        setBookedRequests([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [selectedBarber, selectedDate])

  const canProceed = () => {
    if (isPending) return false
    switch (step) {
      case 1:
        return selectedBarber !== null && !loadingBarbers
      case 2:
        return selectedDate !== undefined && selectedStartTime !== "" && !loadingSlots
      case 3:
        return (
          formData.customerName &&
          formData.customerName.length >= 2 &&
          formData.customerPhone &&
          formData.customerPhone.length >= 10 &&
          (!formData.customerEmail || z.string().email().safeParse(formData.customerEmail).success)
        )
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < 4 && canProceed() && !isPending) {
      setIsTransitioning(true)
      setTimeout(() => {
        setStep(step + 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handleBack = () => {
    if (step > 1 && !isPending) {
      setIsTransitioning(true)
      setTimeout(() => {
        setStep(step - 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handleConfirm = () => {
    if (!selectedBarber || !selectedDate || !selectedStartTime) {
      return
    }

    startTransition(async () => {
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        await createAppointmentRequest({
          barberId: selectedBarber.id,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail || undefined,
          date: dateStr,
          requestedStartTime: selectedStartTime,
        })
        setShowSuccess(true)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Randevu talebi oluşturulurken hata oluştu")
      }
    })
  }

  const handleReset = () => {
    setShowSuccess(false)
    setStep(1)
    setSelectedBarber(null)
    setSelectedDate(new Date())
    setSelectedStartTime("")
    reset()
  }

  const handleStepSubmit = handleSubmit((data) => {
    if (step === 3 && !isPending) {
      setIsTransitioning(true)
      setTimeout(() => {
        setStep(4)
        setIsTransitioning(false)
      }, 150)
    }
  })

  const renderStep = () => {
    if (showSuccess) {
      return (
        <div className="space-y-6 text-center py-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Saat Talebiniz Alındı</h2>
            <p className="text-muted-foreground">
              Berber onayı bekleniyor. Onaylandığında SMS ile bilgilendirileceksiniz.
            </p>
          </div>
          
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 text-left">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Seçtiğiniz saat henüz kesinleşmedi
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Seçtiğiniz saat berber tarafından onaylandığında kesinleşecektir. Onay sonrası SMS ile bilgilendirileceksiniz.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="pt-2">
            <Card>
              <CardContent className="p-6 space-y-3 text-left">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Berber</h3>
                  <p className="font-semibold">{selectedBarber?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tarih</h3>
                  <p className="font-semibold">
                    {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: tr })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Talep Edilen Saat</h3>
                  <p className="font-semibold">
                    {selectedStartTime && (() => {
                      const [hours, minutes] = selectedStartTime.split(":").map(Number)
                      const endTime = new Date(selectedDate!)
                      endTime.setHours(hours, minutes + 60, 0, 0)
                      return `${selectedStartTime} - ${format(endTime, "HH:mm")}`
                    })()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Berber onayı bekleniyor)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <Button onClick={handleReset} className="w-full sm:w-auto" size="lg">
            Yeni Randevu Al
          </Button>
        </div>
      )
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Berber Seçimi</h2>
            {loadingBarbers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : barbers.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Müsait berber yok"
                description="Şu anda aktif berber bulunmamaktadır"
              />
            ) : (
              <div className="space-y-3">
                {barbers.map((barber) => (
                  <Card
                    key={barber.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md active:scale-[0.98]",
                      selectedBarber?.id === barber.id &&
                        "ring-2 ring-primary shadow-md"
                    )}
                    onClick={() => !isPending && setSelectedBarber(barber)}
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
                            <span>{barber.slotDuration} dakika</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Tarih ve Saat Aralığı Seç</h2>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Tarih</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {selectedDate ? (
                        format(selectedDate, "d MMMM yyyy", { locale: tr })
                      ) : (
                        <span>Tarih seçin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="mb-2 block">Saat Seçimi</Label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Bu tarih için müsait saat bulunmamaktadır
                  </div>
                ) : (
                  <>
                    <TimeRangePicker
                      selectedTime={selectedStartTime}
                      onTimeSelect={(time) => setSelectedStartTime(time || "")}
                      availableSlots={availableSlots}
                      selectedDate={selectedDate}
                      blockedSlots={blockedSlots}
                      bookedRequests={bookedRequests}
                    />
                    {selectedStartTime && (
                      <div className="mt-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
                        <p className="text-sm font-medium text-primary">
                          Seçilen: {selectedStartTime}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Bilgiler</h2>
            <form onSubmit={handleStepSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Ad Soyad *</Label>
                <Input
                  id="customerName"
                  {...register("customerName")}
                  className={cn(errors.customerName && "border-destructive")}
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customerPhone">Telefon *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  {...register("customerPhone")}
                  className={cn(errors.customerPhone && "border-destructive")}
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.customerPhone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customerEmail">E-posta (Opsiyonel)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register("customerEmail")}
                  className={cn(errors.customerEmail && "border-destructive")}
                />
                {errors.customerEmail && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.customerEmail.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
                <Input
                  id="notes"
                  {...register("notes")}
                />
              </div>
            </form>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Onay</h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Berber</h3>
                  <p>{selectedBarber?.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tarih</h3>
                  <p>
                    {selectedDate &&
                      format(selectedDate, "d MMMM yyyy", {
                        locale: tr,
                      })}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Saat</h3>
                  <p>
                    {selectedStartTime && (() => {
                      const [hours, minutes] = selectedStartTime.split(":").map(Number)
                      const endTime = new Date(selectedDate!)
                      endTime.setHours(hours, minutes + 60, 0, 0)
                      return `${selectedStartTime} - ${format(endTime, "HH:mm")}`
                    })()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Müşteri Bilgileri</h3>
                  <p>{formData.customerName}</p>
                  <p>{formData.customerPhone}</p>
                  {formData.customerEmail && <p>{formData.customerEmail}</p>}
                  {formData.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        Notlar: {formData.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      <AppHeader title="Randevu Oluştur" />
      <div className="flex-1 pb-32 pt-4">
        <div className="mx-auto max-w-2xl px-4">
          {!showSuccess && <Stepper steps={wizardSteps} currentStep={step} />}
          <div
            className={cn(
              "mt-6 transition-opacity duration-200",
              isTransitioning && "opacity-50 pointer-events-none",
              showSuccess && "mt-0"
            )}
          >
            {renderStep()}
          </div>
        </div>
      </div>
      {!showSuccess && (
        <BottomBar
          primaryLabel={
            isPending
              ? "Yükleniyor..."
              : step === 4
              ? "Onayla"
              : step === 3
              ? "Devam Et"
              : "Devam Et"
          }
          primaryAction={
            step === 3
              ? handleStepSubmit
              : step === 4
              ? handleConfirm
              : handleNext
          }
          primaryDisabled={!canProceed() || isPending || isTransitioning}
          secondaryLabel={step > 1 ? "Geri" : undefined}
          secondaryAction={step > 1 && !isPending && !isTransitioning ? handleBack : undefined}
        />
      )}
    </div>
  )
}
