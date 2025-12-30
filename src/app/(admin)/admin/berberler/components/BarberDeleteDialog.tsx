"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { deactivateBarber, type BarberListForManagement } from "@/lib/actions/barber.actions"

interface BarberDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barber: BarberListForManagement
  futureAppointmentCount: number
  onSuccess: () => void
}

export function BarberDeleteDialog({
  open,
  onOpenChange,
  barber,
  futureAppointmentCount,
  onSuccess,
}: BarberDeleteDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const result = await deactivateBarber(barber.id)

      if (!result.success) {
        toast.error(result.error || "Berber silinirken hata oluştu")
        setLoading(false)
        return
      }

      if (result.hasFutureAppointments) {
        toast.success(
          `Berber pasifleştirildi. ${result.appointmentCount} randevu iptal edildi.`
        )
      } else {
        toast.success("Berber başarıyla pasifleştirildi")
      }

      onSuccess()
    } catch (error) {
      console.error("Error deleting barber:", error)
      toast.error("Bir hata oluştu")
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Berberi Pasifleştir</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              <strong>{barber.name}</strong> adlı berberi pasifleştirmek
              istediğinize emin misiniz?
            </p>
            {futureAppointmentCount > 0 && (
              <div className="rounded-md bg-destructive/10 p-3 mt-3">
                <p className="font-medium text-destructive mb-1">
                  ⚠️ Uyarı
                </p>
                <p className="text-sm">
                  Bu berbere ait <strong>{futureAppointmentCount}</strong> aktif
                  randevu bulunmaktadır.
                </p>
                <p className="text-sm mt-1">
                  Devam ederseniz <strong>TÜM randevular iptal edilecek</strong> ve
                  müşterilere <strong>SMS gönderilmeyecektir</strong>.
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Pasifleştirilen berber listeden tamamen kaybolacaktır.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "İşleniyor..." : "Pasifleştir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


