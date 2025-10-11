"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteBarber } from "@/lib/actions/barber.actions";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteBarberDialogProps {
  barberId: string;
  barberName: string;
}

export function DeleteBarberDialog({ barberId, barberName }: DeleteBarberDialogProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteBarber(barberId);
      if (result.success) {
        toast.success("Berber başarıyla silindi");
        setOpen(false);
      } else {
        toast.error(result.error || "Berber silinirken hata oluştu");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Berberi Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{barberName}</strong> adlı berberi silmek istediğinizden emin misiniz?
            <br />
            <br />
            Bu işlem geri alınamaz. Berberin randevuları varsa, önce randevuları iptal etmeniz gerekebilir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Siliniyor..." : "Sil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
