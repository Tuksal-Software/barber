"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  getBarbersForManagement,
  createBarber,
  updateBarber,
  deactivateBarber,
  checkBarberFutureAppointments,
  type BarberListForManagement,
  type CreateBarberInput,
  type UpdateBarberInput,
} from "@/lib/actions/barber.actions"
import { BarberFormDialog } from "./components/BarberFormDialog"
import { BarberDeleteDialog } from "./components/BarberDeleteDialog"

export const dynamic = 'force-dynamic'

export default function BerberlerPage() {
  const [barbers, setBarbers] = useState<BarberListForManagement[]>([])
  const [loading, setLoading] = useState(true)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingBarber, setEditingBarber] = useState<BarberListForManagement | null>(null)
  const [deletingBarber, setDeletingBarber] = useState<BarberListForManagement | null>(null)
  const [futureAppointmentCount, setFutureAppointmentCount] = useState<number>(0)

  const loadBarbers = async () => {
    setLoading(true)
    try {
      const data = await getBarbersForManagement()
      setBarbers(data)
    } catch (error) {
      console.error("Error loading barbers:", error)
      toast.error("Berberler yüklenirken hata oluştu")
      setBarbers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBarbers()
  }, [])

  const handleCreate = () => {
    setEditingBarber(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (barber: BarberListForManagement) => {
    setEditingBarber(barber)
    setFormDialogOpen(true)
  }

  const handleDelete = async (barber: BarberListForManagement) => {
    setDeletingBarber(barber)
    try {
      const check = await checkBarberFutureAppointments(barber.id)
      setFutureAppointmentCount(check.count)
      setDeleteDialogOpen(true)
    } catch (error) {
      console.error("Error checking appointments:", error)
      toast.error("Randevu kontrolü yapılırken hata oluştu")
    }
  }

  const handleFormSuccess = () => {
    setFormDialogOpen(false)
    setEditingBarber(null)
    loadBarbers()
  }

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false)
    setDeletingBarber(null)
    setFutureAppointmentCount(0)
    loadBarbers()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Berberler</h1>
        <p className="text-muted-foreground">Berber yönetimi ve düzenleme</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Berber Ekle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Berber Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Yükleniyor...
            </div>
          ) : barbers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Henüz berber eklenmemiş
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Foto</TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Deneyim</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barbers.map((barber) => (
                    <TableRow key={barber.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={barber.image || undefined}
                            alt={barber.name}
                          />
                          <AvatarFallback>
                            {getInitials(barber.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{barber.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {barber.email}
                      </TableCell>
                      <TableCell>
                        {barber.experience > 0 ? `${barber.experience} yıl` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={barber.isActive ? "default" : "secondary"}
                        >
                          {barber.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(barber)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(barber)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BarberFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        barber={editingBarber}
        onSuccess={handleFormSuccess}
      />

      {deletingBarber && (
        <BarberDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          barber={deletingBarber}
          futureAppointmentCount={futureAppointmentCount}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  )
}


