"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { tr } from "date-fns/locale/tr"
import { Star, Scissors, Loader2, Clock, CheckCircle2, X } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Stepper } from "@/components/app/Stepper"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { TimeRangePicker } from "@/components/app/TimeRangePicker"
import { HorizontalDatePicker } from "@/components/app/HorizontalDatePicker"
import { EmptyState } from "@/components/app/EmptyState"
import { getActiveBarbers } from "@/lib/actions/barber.actions"
import { getCustomerTimeButtonsV2 } from "@/lib/actions/availability.actions"
import { createAppointmentRequest, getCustomerByPhone } from "@/lib/actions/appointment.actions"
import { requestCancelOtp, confirmCancelOtp } from "@/lib/actions/customer-cancel.actions"
import { getShopName } from "@/lib/actions/settings.actions"
import { getEnableServiceSelectionSetting } from "@/lib/settings/settings-helpers"
import { cn } from "@/lib/utils"
import type { BarberListItem } from "@/lib/actions/barber.actions"
import type { CustomerTimeButton } from "@/lib/actions/availability.actions"

const formSchema = z.object({
  customerName: z.string().min(2, "En az 2 karakter olmalı"),
  customerPhone: z.string().regex(/^\+90[5][0-9]{9}$/, "Geçerli bir telefon numarası girin"),
})

type FormData = z.infer<typeof formSchema>

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [barbers, setBarbers] = useState<BarberListItem[]>([])
  const [loadingBarbers, setLoadingBarbers] = useState(true)
  const [selectedBarber, setSelectedBarber] = useState<BarberListItem | null>(null)
  const [selectedServiceType, setSelectedServiceType] = useState<"saç" | "sakal" | "saç_sakal" | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedStart, setSelectedStart] = useState<string>("")
  const [timeButtons, setTimeButtons] = useState<CustomerTimeButton[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = useState(false)
  const [phoneValue, setPhoneValue] = useState("")
  const [showNameInput, setShowNameInput] = useState(false)
  const [loadingCustomer, setLoadingCustomer] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelStep, setCancelStep] = useState(1)
  const [cancelPhone, setCancelPhone] = useState("")
  const [cancelOtp, setCancelOtp] = useState("")
  const [loadingCancel, setLoadingCancel] = useState(false)
  const [shopName, setShopName] = useState("")
  const [enableServiceSelection, setEnableServiceSelection] = useState(true)

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

  const wizardSteps = useMemo(() => {
    if (enableServiceSelection) {
      return [
        { label: "Berber" },
        { label: "Ürün Seçimi" },
        { label: "Tarih & Saat" },
        { label: "Bilgiler" },
        { label: "Onay" },
      ]
    } else {
      return [
        { label: "Berber" },
        { label: "Tarih & Saat" },
        { label: "Bilgiler" },
        { label: "Onay" },
      ]
    }
  }, [enableServiceSelection])

  const maxStep = enableServiceSelection ? 5 : 4

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
          setShowNameInput(true)
        } catch (error) {
          console.error("Error fetching customer:", error)
          setShowNameInput(true)
        } finally {
          setLoadingCustomer(false)
        }
      } else {
        setShowNameInput(false)
      }
    }
  }

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
    async function fetchShopName() {
      try {
        const name = await getShopName()
        setShopName(name)
      } catch (error) {
        console.error("Shop name yüklenirken hata oluştu:", error)
      }
    }
    fetchShopName()
  }, [])

  useEffect(() => {
    async function fetchEnableServiceSelection() {
      try {
        const enabled = await getEnableServiceSelectionSetting()
        setEnableServiceSelection(enabled)
        if (!enabled) {
          setSelectedServiceType(null)
        }
      } catch (error) {
        console.error("Enable service selection yüklenirken hata oluştu:", error)
      }
    }
    fetchEnableServiceSelection()
  }, [])

  const getDurationFromServiceType = (serviceType: "saç" | "sakal" | "saç_sakal" | null): number | null => {
    if (!serviceType) return null
    if (serviceType === "saç_sakal") return 60
    return 30
  }

  const mapServiceTypeToDb = (serviceType: "saç" | "sakal" | "saç_sakal"): string => {
    if (serviceType === "saç") return "sac"
    if (serviceType === "saç_sakal") return "sac_sakal"
    return "sakal"
  }

  const getBarberInitials = (name: string): string => {
    if (!name || name.trim().length === 0) return "?"
    const parts = name.trim().split(" ").filter(p => p.length > 0)
    if (parts.length === 0) return "?"
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  useEffect(() => {
    if (!selectedBarber || !selectedDate) {
      setTimeButtons([])
      setSelectedStart("")
      return
    }

    if (enableServiceSelection && !selectedServiceType) {
      setTimeButtons([])
      setSelectedStart("")
      return
    }

    async function fetchTimeButtons() {
      try {
        setLoadingSlots(true)
        const dateStr = format(selectedDate!, "yyyy-MM-dd")
        const duration = enableServiceSelection 
          ? getDurationFromServiceType(selectedServiceType) 
          : 60
        if (!duration) {
          setTimeButtons([])
          return
        }
        const buttons = await getCustomerTimeButtonsV2({
          barberId: selectedBarber!.id,
          date: dateStr,
          durationMinutes: duration,
          enableServiceSelection: enableServiceSelection,
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
  }, [selectedBarber, selectedDate, selectedServiceType, enableServiceSelection])

  const canProceed = () => {
    if (isPending) return false
    if (enableServiceSelection) {
      switch (step) {
        case 1:
          return selectedBarber !== null && !loadingBarbers
        case 2:
          return selectedServiceType !== null
        case 3:
          return selectedDate !== undefined && selectedStart !== "" && !loadingSlots
        case 4:
          return (
            formData.customerName &&
            formData.customerName.length >= 2 &&
            formData.customerPhone &&
            /^\+90[5][0-9]{9}$/.test(formData.customerPhone) &&
            showNameInput
          )
        case 5:
          return true
        default:
          return false
      }
    } else {
      switch (step) {
        case 1:
          return selectedBarber !== null && !loadingBarbers
        case 2:
          return selectedDate !== undefined && selectedStart !== "" && !loadingSlots
        case 3:
          return (
            formData.customerName &&
            formData.customerName.length >= 2 &&
            formData.customerPhone &&
            /^\+90[5][0-9]{9}$/.test(formData.customerPhone) &&
            showNameInput
          )
        case 4:
          return true
        default:
          return false
      }
    }
  }

  const handleNext = () => {
    if (step < maxStep && canProceed() && !isPending) {
      setStep(step + 1)
    }
  }

  const handleServiceTypeChange = (serviceType: "saç" | "sakal" | "saç_sakal") => {
    if (selectedServiceType !== serviceType) {
      setSelectedServiceType(serviceType)
      setSelectedDate(new Date())
      setSelectedStart("")
      setTimeButtons([])
    }
  }

  const handleBack = () => {
    if (step > 1 && !isPending) {
      setStep(step - 1)
    }
  }

  const handleConfirm = () => {
    if (!selectedBarber || !selectedDate || !selectedStart) {
      return
    }
    if (enableServiceSelection && !selectedServiceType) {
      return
    }

    startTransition(async () => {
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        const duration = enableServiceSelection 
          ? getDurationFromServiceType(selectedServiceType)
          : 60
        if (!duration) {
          toast.error("Geçersiz ürün seçimi")
          return
        }
        await createAppointmentRequest({
          barberId: selectedBarber.id,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          date: dateStr,
          requestedStartTime: selectedStart,
          serviceType: enableServiceSelection && selectedServiceType 
            ? mapServiceTypeToDb(selectedServiceType) 
            : undefined,
          durationMinutes: duration,
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
    if (enableServiceSelection) {
      setSelectedServiceType(null)
    }
    setSelectedDate(new Date())
    setSelectedStart("")
    setPhoneValue("")
    setShowNameInput(false)
    reset()
  }

  const handleCancelModalOpen = () => {
    setShowCancelModal(true)
    setCancelStep(1)
    setCancelPhone("")
    setCancelOtp("")
  }

  const handleCancelModalClose = () => {
    setShowCancelModal(false)
    setCancelStep(1)
    setCancelPhone("")
    setCancelOtp("")
  }

  const handleCancelPhoneSubmit = async () => {
    if (!cancelPhone.match(/^\+90[5][0-9]{9}$/)) {
      toast.error("Geçerli bir telefon numarası girin")
      return
    }

    setLoadingCancel(true)
    try {
      const result = await requestCancelOtp(cancelPhone)
      if (result.success) {
        setCancelStep(2)
        toast.success("OTP kodunuz SMS ile gönderildi")
      } else {
        toast.error(result.error || "Bir hata oluştu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu")
    } finally {
      setLoadingCancel(false)
    }
  }

  const handleCancelOtpSubmit = async () => {
    if (cancelOtp.length !== 6) {
      toast.error("OTP kodu 6 haneli olmalıdır")
      return
    }

    setLoadingCancel(true)
    try {
      const result = await confirmCancelOtp(cancelPhone, cancelOtp)
      if (result.success) {
        toast.success("Randevunuz başarıyla iptal edildi")
        handleCancelModalClose()
      } else {
        toast.error(result.error || "Bir hata oluştu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu")
    } finally {
      setLoadingCancel(false)
    }
  }

  const normalizeCancelPhone = (value: string): string => {
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

  const handleStepSubmit = handleSubmit((data) => {
    const infoStep = enableServiceSelection ? 4 : 3
    const confirmStep = enableServiceSelection ? 5 : 4
    if (step === infoStep && !isPending) {
      setStep(confirmStep)
    }
  })

  const getStepTitle = () => {
    if (showSuccess) return null
    if (enableServiceSelection) {
      switch (step) {
        case 1:
          return "Berber Seçimi"
        case 2:
          return "Ürün Seçimi"
        case 3:
          return "Tarih ve Saat Aralığı Seç"
        case 4:
          return "Bilgiler"
        case 5:
          return "Onay"
        default:
          return null
      }
    } else {
      switch (step) {
        case 1:
          return "Berber Seçimi"
        case 2:
          return "Tarih ve Saat Aralığı Seç"
        case 3:
          return "Bilgiler"
        case 4:
          return "Onay"
        default:
          return null
      }
    }
  }

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
            <h2 className="text-2xl font-bold text-foreground drop-shadow-md">Randevu Talebin Alındı!</h2>
            <p className="text-muted-foreground drop-shadow-sm">
              Randevunuz onaylandığında size bildirim göndereceğiz.
            </p>
          </div>
          <div className="pt-4">
            <Card className="bg-card/80 backdrop-blur-md border-border/40 shadow-xl rounded-xl">
              <CardContent className="p-6 space-y-3 text-left">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Berber</h3>
                  <p className="font-semibold text-foreground">{selectedBarber?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tarih</h3>
                  <p className="font-semibold text-foreground">
                    {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: tr })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Saat</h3>
                  <p className="font-semibold text-foreground">{selectedStart}</p>
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

    if (enableServiceSelection) {
      switch (step) {
        case 1:
          return (
            <div className="space-y-6">
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
              <div className="space-y-2">
                {barbers.map((barber) => {
                  const isSelected = selectedBarber?.id === barber.id
                  
                  return (
                    <Card
                      key={barber.id}
                      className={cn(
                        "cursor-pointer transition-all hover:bg-muted/40 active:scale-[0.98] bg-card/80 backdrop-blur-md border-border/40 shadow-lg rounded-xl overflow-hidden group",
                        isSelected && "ring-2 ring-primary shadow-xl shadow-primary/20 bg-muted/60"
                      )}
                      onClick={() => !isPending && setSelectedBarber(barber)}
                    >
                      <CardContent className="px-4 py-3 flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <Avatar className={cn(
                            "h-14 w-14 transition-all",
                            isSelected ? "ring-2 ring-primary" : "ring-2 ring-transparent group-hover:ring-primary/50"
                          )}>
                            <AvatarImage
                              src={barber.image || undefined}
                              alt={barber.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-sm font-semibold">
                              {getBarberInitials(barber.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <h3 className="font-semibold text-foreground text-base truncate">{barber.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Scissors className="h-4 w-4 flex-shrink-0" />
                            <span>Profesyonel</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
            <div 
              className="mt-4 text-sm text-red-600 hover:text-red-700 cursor-pointer text-center"
              onClick={handleCancelModalOpen}
            >
              Randevumu İptal Et
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-md border-border/40 shadow-xl rounded-xl">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:bg-muted/40 active:scale-[0.98] bg-card/80 backdrop-blur-md border-border/40 shadow-lg rounded-xl",
                      selectedServiceType === "saç" && "ring-2 ring-primary shadow-xl"
                    )}
                    onClick={() => !isPending && handleServiceTypeChange("saç")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">Saç</h3>
                          <p className="text-sm text-muted-foreground mt-1">30 dakika</p>
                        </div>
                        {selectedServiceType === "saç" && (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:bg-muted/40 active:scale-[0.98] bg-card/80 backdrop-blur-md border-border/40 shadow-lg rounded-xl",
                      selectedServiceType === "sakal" && "ring-2 ring-primary shadow-xl"
                    )}
                    onClick={() => !isPending && handleServiceTypeChange("sakal")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">Sakal</h3>
                          <p className="text-sm text-muted-foreground mt-1">30 dakika</p>
                        </div>
                        {selectedServiceType === "sakal" && (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:bg-muted/40 active:scale-[0.98] bg-card/80 backdrop-blur-md border-border/40 shadow-lg rounded-xl",
                      selectedServiceType === "saç_sakal" && "ring-2 ring-primary shadow-xl"
                    )}
                    onClick={() => !isPending && handleServiceTypeChange("saç_sakal")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">Saç & Sakal</h3>
                          <p className="text-sm text-muted-foreground mt-1">60 dakika</p>
                        </div>
                        {selectedServiceType === "saç_sakal" && (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6 h-full flex flex-col min-h-0">
            <Card className="bg-card/80 backdrop-blur-md border-border/40 shadow-xl rounded-xl flex flex-col flex-1 min-h-0 h-full max-h-[75vh] sm:max-h-[70vh]">
              <CardContent className="p-6 flex flex-col flex-1 min-h-0">
                <div className="flex-shrink-0 mb-4">
                  <Label className="mb-2 block">Tarih</Label>
                  <HorizontalDatePicker
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                </div>

                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex-shrink-0 mb-2">
                    <Label className="block">Saat</Label>
                    {selectedStart && (
                      <div className="mt-2 mb-3 rounded-lg bg-primary/20 border border-primary/40 p-2">
                        <p className="text-xs text-muted-foreground">
                          Seçilen: {selectedStart}
                        </p>
                      </div>
                    )}
                  </div>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8 flex-shrink-0">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : timeButtons.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm flex-shrink-0">
                      Bu tarih için müsait saat bulunmamaktadır
                    </div>
                  ) : (
                    <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                      <TimeRangePicker
                        selectedStart={selectedStart}
                        onStartSelect={setSelectedStart}
                        timeButtons={timeButtons}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-md border-border/40 shadow-xl rounded-xl">
              <CardContent className="p-6">
                <form onSubmit={handleStepSubmit} className="space-y-4">
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
                          "bg-muted/40 border-border/40 text-foreground placeholder:text-muted-foreground/60",
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

                  {showNameInput && (
                    <div>
                      <Label htmlFor="customerName">Ad Soyad *</Label>
                      <Input
                        id="customerName"
                        {...register("customerName")}
                        className={cn(
                          "bg-muted/40 border-border/40 text-foreground placeholder:text-muted-foreground/60",
                          errors.customerName && "border-destructive"
                        )}
                      />
                      {errors.customerName && (
                        <p className="mt-1 text-sm text-destructive">
                          {errors.customerName.message}
                        </p>
                      )}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        )

        case 5:
          return (
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-md border-border/40 shadow-xl rounded-xl">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground">Berber</h3>
                    <p className="text-foreground">{selectedBarber?.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground">Ürün</h3>
                    <p className="text-foreground">
                      {selectedServiceType === "saç" && "Saç"}
                      {selectedServiceType === "sakal" && "Sakal"}
                      {selectedServiceType === "saç_sakal" && "Saç & Sakal"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground">Tarih</h3>
                    <p className="text-foreground">
                      {selectedDate &&
                        format(selectedDate, "d MMMM yyyy", {
                          locale: tr,
                        })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground">Saat</h3>
                    <p className="text-foreground">
                      {selectedStart}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground">Müşteri Bilgileri</h3>
                    <p className="text-foreground">{formData.customerName}</p>
                    <p className="text-foreground">{formData.customerPhone}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )

        default:
          return null
      }
    } else {
      switch (step) {
        case 1:
          return (
            <div className="space-y-6">
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
                <div className="space-y-2">
                  {barbers.map((barber) => {
                    const isSelected = selectedBarber?.id === barber.id
                    
                    return (
                      <Card
                        key={barber.id}
                        className={cn(
                          "cursor-pointer transition-all hover:bg-muted/40 active:scale-[0.98] bg-card/80 backdrop-blur-md border-border/40 shadow-lg rounded-xl overflow-hidden group",
                          isSelected && "ring-2 ring-primary shadow-xl shadow-primary/20 bg-muted/60"
                        )}
                        onClick={() => !isPending && setSelectedBarber(barber)}
                      >
                        <CardContent className="px-4 py-3 flex items-center gap-4">
                          <div className="relative flex-shrink-0">
                            <Avatar className={cn(
                              "h-14 w-14 transition-all",
                              isSelected ? "ring-2 ring-primary" : "ring-2 ring-transparent group-hover:ring-primary/50"
                            )}>
                              <AvatarImage
                                src={barber.image || undefined}
                                alt={barber.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-sm font-semibold">
                                {getBarberInitials(barber.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <h3 className="font-semibold text-foreground text-base truncate">{barber.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Scissors className="h-4 w-4 flex-shrink-0" />
                              <span>Profesyonel</span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
              <div 
                className="mt-4 text-sm text-red-600 hover:text-red-700 cursor-pointer text-center"
                onClick={handleCancelModalOpen}
              >
                Randevumu İptal Et
              </div>
            </div>
          )

        case 2:
          return (
            <div className="space-y-6 h-full flex flex-col min-h-0">
              <Card className="bg-card/80 backdrop-blur-md border-border/40 shadow-xl rounded-xl flex flex-col flex-1 min-h-0 h-full max-h-[75vh] sm:max-h-[70vh]">
                <CardContent className="p-6 flex flex-col flex-1 min-h-0">
                  <div className="flex-shrink-0 mb-4">
                    <Label className="mb-2 block">Tarih</Label>
                    <HorizontalDatePicker
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex-shrink-0 mb-2">
                      <Label className="block">Saat</Label>
                      {selectedStart && (
                        <div className="mt-2 mb-3 rounded-lg bg-primary/20 border border-primary/40 p-2">
                          <p className="text-xs text-muted-foreground">
                            Seçilen: {selectedStart}
                          </p>
                        </div>
                      )}
                    </div>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8 flex-shrink-0">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : timeButtons.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm flex-shrink-0">
                        Bu tarih için müsait saat bulunmamaktadır
                      </div>
                    ) : (
                      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                        <TimeRangePicker
                          selectedStart={selectedStart}
                          onStartSelect={setSelectedStart}
                          timeButtons={timeButtons}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )

        case 3:
          return (
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-md border-border/40 shadow-xl rounded-xl">
                <CardContent className="p-6">
                  <form onSubmit={handleStepSubmit} className="space-y-4">
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
                            "bg-muted/40 border-border/40 text-foreground placeholder:text-muted-foreground/60",
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

                    {showNameInput && (
                      <div>
                        <Label htmlFor="customerName">Ad Soyad *</Label>
                        <Input
                          id="customerName"
                          {...register("customerName")}
                          className={cn(
                            "bg-muted/40 border-border/40 text-foreground placeholder:text-muted-foreground/60",
                            errors.customerName && "border-destructive"
                          )}
                        />
                        {errors.customerName && (
                          <p className="mt-1 text-sm text-destructive">
                            {errors.customerName.message}
                          </p>
                        )}
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          )

        case 4:
          return (
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-md border-border/40 shadow-xl rounded-xl">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground">Berber</h3>
                    <p className="text-foreground">{selectedBarber?.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground">Tarih</h3>
                    <p className="text-foreground">
                      {selectedDate &&
                        format(selectedDate, "d MMMM yyyy", {
                          locale: tr,
                        })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground">Saat</h3>
                    <p className="text-foreground">
                      {selectedStart}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground">Müşteri Bilgileri</h3>
                    <p className="text-foreground">{formData.customerName}</p>
                    <p className="text-foreground">{formData.customerPhone}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )

        default:
          return null
      }
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
        <div
            className="
            fixed inset-0 -z-10
            bg-[url('/hero.jpg')] bg-cover bg-center bg-no-repeat
            before:absolute before:inset-0 before:bg-black/50
            will-change-transform
            translate-z-0
            blur-[3px]
            scale-[1.02]
          "
        />
      <div className="relative z-10 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0 flex justify-center pt-4 pb-1 sm:pt-6 sm:pb-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-auto max-w-[140px] sm:max-w-[160px] opacity-95"
            priority
          />
        </div>
        <div className="flex-shrink-0 font-medium text-center text-sm sm:text-base mb-1 sm:mb-2 pb-2">
          {shopName}
        </div>
        {!showSuccess && (
          <div className="flex-shrink-0 flex justify-center">
            <div className="w-full max-w-2xl px-4">
              <Stepper steps={wizardSteps} currentStep={step} />
            </div>
          </div>
        )}
        {!showSuccess && getStepTitle() && (
          <div className="flex-shrink-0 px-4 pt-2 sm:pt-4">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground drop-shadow-md">
                {getStepTitle()}
              </h2>
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-hidden">
            <div className="mx-auto max-w-2xl px-4 py-4 h-full flex flex-col min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="h-full flex flex-col min-h-0"
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        {!showSuccess && (
          <div className="flex-shrink-0 border-t bg-background p-4">
            <div className="mx-auto flex max-w-2xl gap-3">
              {step > 1 && !isPending && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Geri
                </Button>
              )}
              <Button
                onClick={
                  (enableServiceSelection && step === 4) || (!enableServiceSelection && step === 3)
                    ? handleStepSubmit
                    : step === maxStep
                    ? handleConfirm
                    : handleNext
                }
                disabled={!canProceed() || isPending}
                className={step > 1 && !isPending ? "flex-1" : "w-full"}
              >
                {isPending
                  ? "Yükleniyor..."
                  : step === maxStep
                  ? "Onayla"
                  : (enableServiceSelection && step === 4) || (!enableServiceSelection && step === 3)
                  ? "Devam Et"
                  : "Devam Et"}
              </Button>
            </div>
          </div>
        )}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Randevu İptali</DialogTitle>
              <DialogDescription>
                {cancelStep === 1
                  ? "Randevunuzu iptal etmek için telefon numaranızı girin"
                  : "Telefonunuza gönderilen 6 haneli OTP kodunu girin"}
              </DialogDescription>
            </DialogHeader>
            {cancelStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cancelPhone">Telefon Numarası</Label>
                  <Input
                    id="cancelPhone"
                    type="tel"
                    value={cancelPhone}
                    onChange={(e) => {
                      const normalized = normalizeCancelPhone(e.target.value)
                      if (normalized.length <= 13) {
                        setCancelPhone(normalized)
                      }
                    }}
                    placeholder="5xxxxxxxxx"
                    maxLength={13}
                    className="mt-1"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCancelModalClose}>
                    İptal
                  </Button>
                  <Button onClick={handleCancelPhoneSubmit} disabled={loadingCancel || !cancelPhone.match(/^\+90[5][0-9]{9}$/)}>
                    {loadingCancel ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Yükleniyor...
                      </>
                    ) : (
                      "Devam Et"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cancelOtp">OTP Kodu</Label>
                  <Input
                    id="cancelOtp"
                    type="text"
                    value={cancelOtp}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "")
                      if (digits.length <= 6) {
                        setCancelOtp(digits)
                      }
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className="mt-1 text-center text-2xl tracking-widest"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCancelStep(1)}>
                    Geri
                  </Button>
                  <Button onClick={handleCancelOtpSubmit} disabled={loadingCancel || cancelOtp.length !== 6}>
                    {loadingCancel ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Yükleniyor...
                      </>
                    ) : (
                      "Randevuyu İptal Et"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
