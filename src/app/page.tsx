"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { tr } from "date-fns/locale/tr"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  X,
  Scissors,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { getActiveBarbers } from "@/lib/actions/barber.actions"
import { getCustomerTimeButtonsV2 } from "@/lib/actions/availability.actions"
import { createAppointmentRequest, getCustomerByPhone } from "@/lib/actions/appointment.actions"
import { requestCancelOtp, confirmCancelOtp } from "@/lib/actions/customer-cancel.actions"
import { getShopName } from "@/lib/actions/settings.actions"
import { getEnableServiceSelectionSetting } from "@/lib/settings/settings-helpers"
import type { BarberListItem } from "@/lib/actions/barber.actions"
import type { CustomerTimeButton } from "@/lib/actions/availability.actions"

const formSchema = z.object({
  customerName: z.string().min(2, "En az 2 karakter olmalı"),
  customerPhone: z.string().regex(/^\+90[5][0-9]{9}$/, "Geçerli bir telefon numarası girin"),
})

type FormData = z.infer<typeof formSchema>

const getBarberInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name[0]?.toUpperCase() || "B"
}

// Service types
const serviceTypes = [
  { id: "sac" as const, label: "Saç", icon: "✂️", duration: "30 dk" },
  { id: "sakal" as const, label: "Sakal", icon: "🪒", duration: "30 dk" },
  { id: "sac_sakal" as const, label: "Saç + Sakal", icon: "💈", duration: "60 dk" },
]

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [barbers, setBarbers] = useState<BarberListItem[]>([])
  const [loadingBarbers, setLoadingBarbers] = useState(true)
  const [selectedBarber, setSelectedBarber] = useState<BarberListItem | null>(null)
  const [selectedServiceType, setSelectedServiceType] = useState<"sac" | "sakal" | "sac_sakal" | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTimeButton, setSelectedTimeButton] = useState<CustomerTimeButton | null>(null)
  const [timeButtons, setTimeButtons] = useState<CustomerTimeButton[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = useState(false)
  const [enableServiceSelection, setEnableServiceSelection] = useState(false)
  const [shopName, setShopName] = useState("Berber")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelPhone, setCancelPhone] = useState("")
  const [cancelOtp, setCancelOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loadingCancel, setLoadingCancel] = useState(false)
  const [cancelStep, setCancelStep] = useState(1)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
    }
  })

  const formData = watch()

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoadingBarbers(true)
        const [barbersData, serviceSelectionEnabled, name] = await Promise.all([
          getActiveBarbers(),
          getEnableServiceSelectionSetting(),
          getShopName(),
        ])
        setBarbers(barbersData)
        setEnableServiceSelection(serviceSelectionEnabled)
        setShopName(name)
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Veriler yüklenirken hata oluştu")
      } finally {
        setLoadingBarbers(false)
      }
    }
    loadInitialData()
  }, [])

  // Auto-fetch customer name
  useEffect(() => {
    if (formData.customerPhone?.match(/^\+90[5][0-9]{9}$/)) {
      getCustomerByPhone(formData.customerPhone).then((result) => {
        if (result?.customerName && !formData.customerName) {
          setValue("customerName", result.customerName)
          toast.success("Hoş geldin " + result.customerName + "!")
        }
      })
    }
  }, [formData.customerPhone, formData.customerName, setValue])

  // Load time slots
  useEffect(() => {
    if (!selectedBarber || !selectedDate) {
      setTimeButtons([])
      return
    }

    async function fetchTimeSlots() {
      try {
        setLoadingSlots(true)
        const dateStr = format(selectedDate!, "yyyy-MM-dd")
        const durationMinutes = !enableServiceSelection 
          ? 60 
          : selectedServiceType === "sac_sakal" 
            ? 60 
            : 30
        const buttons = await getCustomerTimeButtonsV2({
          barberId: selectedBarber!.id,
          date: dateStr,
          durationMinutes,
          enableServiceSelection,
        })
        setTimeButtons(buttons)
      } catch (error) {
        toast.error("Müsait saatler yüklenirken hata oluştu")
        setTimeButtons([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchTimeSlots()
  }, [selectedBarber, selectedDate, selectedServiceType, enableServiceSelection])

  const totalSteps = enableServiceSelection ? 5 : 4

  const handleBarberSelect = (barber: BarberListItem) => {
    setSelectedBarber(barber)
    setStep(enableServiceSelection ? 2 : 2)
  }

  const handleServiceSelect = (service: "sac" | "sakal" | "sac_sakal") => {
    setSelectedServiceType(service)
    setStep(3)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTimeButton(null)
  }

  const handleTimeSelect = (button: CustomerTimeButton) => {
    if (button.disabled) return
    setSelectedTimeButton(button)
    setStep(enableServiceSelection ? 4 : 3)
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const onSubmit = handleSubmit((data) => {
    if (!selectedBarber || !selectedDate || !selectedTimeButton) {
      toast.error("Lütfen tüm alanları doldurun")
      return
    }

    startTransition(async () => {
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        const durationMinutes = !enableServiceSelection 
          ? 60 
          : selectedServiceType === "sac_sakal" 
            ? 60 
            : 30

        await createAppointmentRequest({
          barberId: selectedBarber.id,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: undefined,
          date: dateStr,
          requestedStartTime: selectedTimeButton.time,
          requestedEndTime: undefined,
          serviceType: enableServiceSelection && selectedServiceType
              ? selectedServiceType
              : undefined,
          durationMinutes,
        })

        setShowSuccess(true)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Randevu oluşturulurken hata oluştu")
      }
    })
  })

  const handleCancelPhoneSubmit = async () => {
    if (!cancelPhone.match(/^\+90[5][0-9]{9}$/)) {
      toast.error("Geçerli bir telefon numarası girin")
      return
    }

    setLoadingCancel(true)
    try {
      const result = await requestCancelOtp(cancelPhone)
      if (result.success) {
        setOtpSent(true)
        setCancelStep(2)
        toast.success("Onay kodu gönderildi")
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
    if (!cancelOtp || cancelOtp.length !== 6) {
      toast.error("Geçerli bir kod girin")
      return
    }

    setLoadingCancel(true)
    try {
      const result = await confirmCancelOtp(cancelPhone, cancelOtp)
      if (result.success) {
        toast.success("Randevunuz iptal edildi")
        setShowCancelDialog(false)
        setCancelPhone("")
        setCancelOtp("")
        setOtpSent(false)
        setCancelStep(1)
      } else {
        toast.error(result.error || "Bir hata oluştu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu")
    } finally {
      setLoadingCancel(false)
    }
  }

  const handleCancelRequest = handleCancelPhoneSubmit
  const handleCancelConfirm = handleCancelOtpSubmit

  const handleCancelModalOpen = () => {
    setShowCancelDialog(true)
    setCancelStep(1)
    setOtpSent(false)
  }

  const normalizePhone = (value: string): string => {
    const digits = value.replace(/\D/g, "")
    if (digits.length === 0) return ""
    if (digits.startsWith("90") && digits.length >= 12) return `+${digits.slice(0, 12)}`
    if (digits.startsWith("0") && digits.length >= 11) return `+90${digits.slice(1, 11)}`
    if (digits.startsWith("5") && digits.length >= 10) return `+90${digits.slice(0, 10)}`
    if (digits.length > 0) {
      if (digits.startsWith("90")) return `+${digits.slice(0, 12)}`
      if (digits.startsWith("0")) return `+90${digits.slice(1, 11)}`
      if (digits.startsWith("5")) return `+90${digits.slice(0, 10)}`
      return `+90${digits.slice(0, 10)}`
    }
    return ""
  }

  // Generate available dates (next 60 days)
  const availableDates = useMemo(() => {
    const dates: Date[] = []
    const today = new Date()
    for (let i = 0; i < 60; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [])

  return (
      <div className="min-h-screen bg-slate-50 overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-4xl">
            <div className="flex items-center gap-3">
              <Image
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-lg object-contain"
                  priority
              />
              <h1 className="text-xl font-bold text-slate-900">{shopName}</h1>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelModalOpen}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-4 h-4 mr-1" />
              İptal Et
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-4xl min-h-[calc(100vh-80px)]">
          {/* Progress Indicator */}
          {!showSuccess && (
              <div className="mb-12">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 px-2">
                  {Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNum = index + 1
                    const isActive = stepNum === step
                    const isCompleted = stepNum < step

                    return (
                        <div key={stepNum} className="flex items-center">
                          <div
                              className={cn(
                                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all",
                                  isCompleted && "bg-green-500 text-white",
                                  isActive && "bg-blue-500 text-white ring-2 sm:ring-4 ring-blue-100",
                                  !isActive && !isCompleted && "bg-slate-300 text-slate-600"
                              )}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : stepNum}
                          </div>
                          {stepNum < totalSteps && (
                              <div
                                  className={cn(
                                      "h-0.5 w-8 sm:w-16 mx-0.5 sm:mx-2 transition-all",
                                      isCompleted ? "bg-green-500" : "bg-slate-300"
                                  )}
                              />
                          )}
                        </div>
                    )
                  })}
                </div>
              </div>
          )}

          <AnimatePresence mode="wait">
            {showSuccess ? (
                <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-6 py-8"
                >
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                      <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900">Başarılı!</h2>
                    <p className="text-slate-600 text-lg px-4">
                      Randevu talebiniz alındı. Onaylandığında size bildirim göndereceğiz.
                    </p>
                  </div>

                  <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-xl rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                        <h3 className="text-white font-semibold text-lg">Randevu Detayları</h3>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                          <Avatar className="h-14 w-14 ring-2 ring-slate-200">
                            <AvatarImage src={selectedBarber?.image || undefined} alt={selectedBarber?.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold">
                              {selectedBarber?.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Berber</p>
                            <p className="font-bold text-slate-900 text-lg">{selectedBarber?.name}</p>
                          </div>
                        </div>

                        {enableServiceSelection && selectedServiceType && (
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-2">
                              <Scissors className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 font-medium">Hizmet</p>
                              <p className="font-semibold text-slate-900">
                                {selectedServiceType === "sac" && "Saç"}
                                {selectedServiceType === "sakal" && "Sakal"}
                                {selectedServiceType === "sac_sakal" && "Saç + Sakal"}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-500 font-medium">Tarih & Saat</p>
                            <p className="font-semibold text-slate-900">
                              {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: tr })}
                            </p>
                            <p className="font-bold text-blue-600 text-lg mt-1">
                              {selectedTimeButton?.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 bg-green-100 rounded-lg p-2">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-500 font-medium">Müşteri Bilgileri</p>
                            <p className="font-semibold text-slate-900">{formData.customerName}</p>
                            <p className="text-sm text-slate-600">{formData.customerPhone}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    size="lg"
                    onClick={() => window.location.reload()}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg h-14 text-base font-semibold"
                  >
                    Yeni Randevu Al
                  </Button>
                </motion.div>
            ) : (
                <>
                  {/* Step 1: Barber Selection */}
                  {step === 1 && (
                      <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <h2 className="text-3xl font-bold text-slate-900 mb-3">Berber Seçin</h2>
                          <p className="text-slate-600">Randevu almak istediğiniz berberi seçin</p>
                        </div>

                        {loadingBarbers ? (
                            <div className="space-y-4">
                              {Array.from({ length: 3 }).map((_, i) => (
                                  <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
                              ))}
                            </div>
                        ) : barbers.length === 0 ? (
                            <Card className="bg-white">
                              <CardContent className="py-16 text-center">
                                <p className="text-slate-600">Aktif berber bulunamadı</p>
                              </CardContent>
                            </Card>
                        ) : (
                            <div className={cn(
                              "grid gap-3",
                              barbers.length === 1 
                                ? "grid-cols-1 place-items-center max-w-xs mx-auto" 
                                : "grid-cols-2 sm:grid-cols-3"
                            )}>
                              {barbers.map((barber) => {
                                const isSelected = selectedBarber?.id === barber.id
                                
                                return (
                                  <Card
                                    key={barber.id}
                                    className={cn(
                                      "cursor-pointer transition-all hover:shadow-xl active:scale-[0.98] bg-white/90 backdrop-blur-md border-slate-200 shadow-lg rounded-2xl overflow-hidden group relative",
                                      isSelected && "ring-2 ring-primary shadow-2xl shadow-primary/30 bg-blue-50/60"
                                    )}
                                    onClick={() => !isPending && handleBarberSelect(barber)}
                                  >
                                    <CardContent className="p-0">
                                      <div className="flex flex-col items-center text-center p-6 space-y-4 bg-gradient-to-br from-slate-50 to-white">
                                        <div className="relative">
                                          <Avatar className={cn(
                                            "h-24 w-24 transition-all ring-4",
                                            isSelected 
                                              ? "ring-blue-500 shadow-lg" 
                                              : "ring-slate-200 group-hover:ring-blue-300 group-hover:shadow-md"
                                          )}>
                                            <AvatarImage
                                              src={barber.image || undefined}
                                              alt={barber.name}
                                              className="object-cover"
                                            />
                                            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                              {getBarberInitials(barber.name)}
                                            </AvatarFallback>
                                          </Avatar>
                                          {isSelected && (
                                            <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                                              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-1">
                                          <h3 className="font-bold text-lg text-slate-900">{barber.name}</h3>
                                          <div className="flex items-center justify-center gap-1.5 text-sm text-slate-600">
                                            <Scissors className="h-3.5 w-3.5" />
                                            <span>Profesyonel Berber</span>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              })}
                            </div>
                        )}
                      </motion.div>
                  )}

                  {/* Step 2: Service Selection (if enabled) */}
                  {step === 2 && enableServiceSelection && (
                      <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <h2 className="text-3xl font-bold text-slate-900 mb-3">Hizmet Seçin</h2>
                          <p className="text-slate-600">Almak istediğiniz hizmeti seçin</p>
                        </div>

                        <div className="space-y-4">
                          {serviceTypes.map((service) => (
                              <Card
                                  key={service.id}
                                  className={cn(
                                      "cursor-pointer transition-all hover:shadow-lg",
                                      selectedServiceType === service.id
                                          ? "border-2 border-blue-500 bg-blue-50/50"
                                          : "border border-slate-200 bg-white hover:border-blue-300"
                                  )}
                                  onClick={() => handleServiceSelect(service.id)}
                              >
                                <CardContent className="p-5">
                                  <div className="flex items-center gap-4">
                                    <div className="text-4xl">{service.icon}</div>
                                    <div className="flex-1">
                                      <h3 className="text-lg font-semibold text-slate-900">{service.label}</h3>
                                      <p className="text-sm text-slate-600">{service.duration}</p>
                                    </div>
                                    {selectedServiceType === service.id && (
                                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                          ))}
                        </div>

                        <Button
                            onClick={handleBack}
                            className="w-full mt-6 h-12 bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-50"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Geri
                        </Button>
                      </motion.div>
                  )}

                  {/* Step 3: Date & Time Selection - MOBİL OPTIMIZED */}
                  {((step === 3 && enableServiceSelection) || (step === 2 && !enableServiceSelection)) && (
                      <motion.div
                          key="step-datetime"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6 h-full flex flex-col min-h-0"
                      >
                        <div className="text-center mb-4 flex-shrink-0">
                          <h2 className="text-3xl font-bold text-slate-900 mb-3">Tarih ve Saat Seçin</h2>
                          <p className="text-slate-600">Randevu tarihi ve saati belirleyin</p>
                        </div>

                        <Card className="bg-white/90 backdrop-blur-md border-slate-200 shadow-xl rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden">
                          <CardContent className="p-6 flex flex-col flex-1 min-h-0">
                            <div className="flex-shrink-0 mb-4">
                              <div className="flex items-center gap-2 text-slate-900 font-semibold mb-3">
                                <CalendarIcon className="w-5 h-5" />
                                <span>Tarih</span>
                              </div>
                              <div className="overflow-x-auto pb-3 scrollbar-hide">
                                <div className="flex gap-2">
                                  {availableDates.map((date, index) => {
                                    const isSelected = selectedDate && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                                    const dayName = format(date, "EEE", { locale: tr }).toUpperCase()
                                    const dayNum = format(date, "d")

                                    return (
                                      <button
                                        key={`date-${index}`}
                                        onClick={() => handleDateSelect(date)}
                                        className={cn(
                                          "flex flex-col items-center justify-center px-3 py-3 rounded-xl border-2 transition-all min-w-[60px] flex-shrink-0",
                                          isSelected
                                            ? "border-blue-500 bg-blue-500 text-white shadow-lg"
                                            : "border-slate-300 bg-white text-slate-900 hover:border-blue-300"
                                        )}
                                      >
                                        <span className="text-xs font-medium mb-1">{dayName}</span>
                                        <span className="text-xl font-bold">{dayNum}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>

                            {selectedDate && (
                              <div className="flex flex-col flex-1 min-h-0">
                                <div className="flex-shrink-0 mb-3">
                                  <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                    <Clock className="w-5 h-5" />
                                    <span>Saat</span>
                                  </div>
                                </div>
                                
                                {loadingSlots ? (
                                  <div className="flex items-center justify-center py-12 flex-shrink-0">
                                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                  </div>
                                ) : timeButtons.length === 0 ? (
                                  <div className="text-center py-12 text-slate-600 flex-shrink-0">
                                    Bu tarih için müsait saat bulunamadı
                                  </div>
                                ) : (
                                  <div className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                                    <div className="grid grid-cols-4 gap-2 pb-2">
                                      {timeButtons.map((button, index) => (
                                        <button
                                          key={`time-${button.time}-${index}`}
                                          onClick={() => handleTimeSelect(button)}
                                          disabled={button.disabled}
                                          className={cn(
                                            "flex items-center justify-center py-3 rounded-xl border-2 transition-all font-semibold text-sm min-h-[56px]",
                                            button.disabled
                                              ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                                              : selectedTimeButton?.time === button.time
                                                ? "border-blue-500 bg-blue-500 text-white shadow-lg"
                                                : "border-slate-300 bg-white text-slate-900 hover:border-blue-300"
                                          )}
                                        >
                                          {button.time}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Button
                            onClick={handleBack}
                            className="w-full mt-6 h-12 bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-50 flex-shrink-0"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Geri
                        </Button>
                      </motion.div>
                  )}

                  {/* Step 4: Customer Info - E-POSTA KALDIRILDI + LIGHT THEME */}
                  {((step === 4 && enableServiceSelection) || (step === 3 && !enableServiceSelection)) && (
                      <motion.div
                          key="step-info"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <h2 className="text-3xl font-bold text-slate-900 mb-3">Bilgileriniz</h2>
                          <p className="text-slate-600">İletişim bilgilerinizi girin</p>
                        </div>

                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md rounded-xl">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 bg-blue-500 rounded-full p-3">
                                <CalendarIcon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-slate-600 font-medium mb-1">Seçilen Randevu</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900">
                                    {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: tr })}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="font-bold text-blue-600">
                                    {selectedTimeButton?.time}
                                  </span>
                                </div>
                              </div>
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white/90 backdrop-blur-md border-slate-200 shadow-xl rounded-2xl">
                          <CardContent className="p-6">
                            <form onSubmit={onSubmit} className="space-y-5">
                          <div className="space-y-2">
                            <Label className="text-slate-900 font-semibold flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Telefon Numarası *
                            </Label>
                            <Input
                                {...register("customerPhone")}
                                type="tel"
                                placeholder="+90 555 123 4567"
                                className="h-14 text-base bg-white border-slate-300 text-slate-900"
                                onChange={(e) => {
                                  const normalized = normalizePhone(e.target.value)
                                  setValue("customerPhone", normalized)
                                }}
                            />
                            {errors.customerPhone && (
                                <p className="text-sm text-red-600">{errors.customerPhone.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-900 font-semibold flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Ad Soyad *
                            </Label>
                            <Input
                                {...register("customerName")}
                                placeholder="Adınız Soyadınız"
                                className="h-14 text-base bg-white border-slate-300 text-slate-900"
                            />
                            {errors.customerName && (
                                <p className="text-sm text-red-600">{errors.customerName.message}</p>
                            )}
                          </div>

                              <div className="flex gap-3 pt-6">
                                <Button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex-1 h-12 bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-50"
                                >
                                  <ChevronLeft className="w-4 h-4 mr-2" />
                                  Geri
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!formData.customerName || !formData.customerPhone || isPending}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12"
                                >
                                  {isPending ? (
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                      <>
                                        Onayla
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                      </>
                                  )}
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      </motion.div>
                  )}

                  {/* Step 5: Confirmation */}
                  {((step === 5 && enableServiceSelection) || (step === 4 && !enableServiceSelection)) && (
                      <motion.div
                          key="step-confirm"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <h2 className="text-3xl font-bold text-slate-900 mb-3">Randevu Özeti</h2>
                          <p className="text-slate-600">Bilgilerinizi kontrol edin</p>
                        </div>

                        <Card className="bg-white shadow-lg">
                          <CardContent className="p-6 space-y-5">
                            <div className="flex items-start gap-4 pb-5 border-b border-slate-200">
                              <Avatar className="w-16 h-16">
                                <AvatarImage src={selectedBarber?.image || undefined} alt={selectedBarber?.name} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold">
                                  {selectedBarber?.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900">{selectedBarber?.name}</h3>
                                {enableServiceSelection && selectedServiceType && (
                                    <Badge className="mt-1 bg-blue-100 text-blue-700">
                                      {serviceTypes.find(s => s.id === selectedServiceType)?.label}
                                    </Badge>
                                )}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <CalendarIcon className="w-5 h-5 text-blue-500" />
                                <span className="font-medium text-slate-900">
                            {selectedDate && format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
                          </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <span className="font-medium text-slate-900">
                            {selectedTimeButton?.time}
                          </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-blue-500" />
                                <span className="font-medium text-slate-900">{formData.customerName}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-blue-500" />
                                <span className="font-medium text-slate-900">{formData.customerPhone}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex gap-3 pt-4">
                          <Button
                              onClick={handleBack}
                              disabled={isPending}
                              className="flex-1 h-12 bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-50"
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Geri
                          </Button>
                          <Button
                              onClick={onSubmit}
                              disabled={isPending}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white h-12"
                          >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                  <CheckCircle2 className="w-5 h-5 mr-2" />
                                  Onayla
                                </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                  )}
                </>
            )}
          </AnimatePresence>
        </main>

        {/* Cancel Dialog - LIGHT THEME FIX */}
        <Dialog 
          open={showCancelDialog} 
          onOpenChange={(open) => {
            setShowCancelDialog(open)
            if (!open) {
              setCancelStep(1)
              setOtpSent(false)
              setCancelPhone("")
              setCancelOtp("")
            }
          }}
        >
          <DialogContent className="bg-white border-slate-200 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-xl">Randevu İptal</DialogTitle>
              <DialogDescription className="text-slate-600">
                {cancelStep === 1
                  ? "Randevunuzu iptal etmek için telefon numaranızı girin"
                  : "Telefonunuza gönderilen kodu girin"}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {cancelStep === 1 ? (
                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium">Telefon Numarası</Label>
                  <Input
                    type="tel"
                    value={cancelPhone}
                    onChange={(e) => {
                      const normalized = normalizePhone(e.target.value)
                      if (normalized.length <= 13) {
                        setCancelPhone(normalized)
                      }
                    }}
                    placeholder="+90 555 123 4567"
                    maxLength={13}
                    className="h-12 bg-white border-slate-300 text-slate-900 text-base"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium">Onay Kodu</Label>
                  <Input
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
                    className="h-14 text-center text-xl tracking-wider bg-white border-slate-300 text-slate-900 font-semibold"
                  />
                  <p className="text-xs text-slate-500 text-center mt-2">
                    6 haneli kodu telefonunuza gönderilen SMS'ten alabilirsiniz
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (cancelStep === 2) {
                    setCancelStep(1)
                    setOtpSent(false)
                  } else {
                    setShowCancelDialog(false)
                    setCancelPhone("")
                    setCancelOtp("")
                    setCancelStep(1)
                    setOtpSent(false)
                  }
                }}
                className="w-full sm:w-auto bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                disabled={loadingCancel}
              >
                {cancelStep === 2 ? "Geri" : "Vazgeç"}
              </Button>
              <Button
                onClick={cancelStep === 1 ? handleCancelPhoneSubmit : handleCancelOtpSubmit}
                disabled={
                  loadingCancel ||
                  (cancelStep === 1 && !cancelPhone.match(/^\+90[5][0-9]{9}$/)) ||
                  (cancelStep === 2 && cancelOtp.length !== 6)
                }
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loadingCancel ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Yükleniyor...
                  </>
                ) : cancelStep === 1 ? (
                  "Kod Gönder"
                ) : (
                  "Onayla"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}