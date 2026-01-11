"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { getRecurringExpenses } from "@/lib/actions/recurring-expense.actions"
import type { RecurringExpenseItem } from "@/lib/actions/recurring-expense.actions"
import { AddRecurringExpenseDialog } from "./components/AddRecurringExpenseDialog"
import { RecurringExpenseTable } from "./components/RecurringExpenseTable"
import { toast } from "sonner"

export const dynamic = 'force-dynamic'

export default function SabitGiderlerPage() {
  const [expenses, setExpenses] = useState<RecurringExpenseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    setLoading(true)
    try {
      const data = await getRecurringExpenses()
      setExpenses(data)
    } catch (error) {
      console.error("Error loading recurring expenses:", error)
      toast.error("Veriler yüklenirken hata oluştu")
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseAdded = () => {
    loadExpenses()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Sabit Giderler</h1>
        <p className="text-muted-foreground">
          Belirli aralıklarla otomatik olarak eklenen giderleri buradan yönetebilirsiniz.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Sabit Gider Ekle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sabit Giderler</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Yükleniyor...
            </div>
          ) : (
            <RecurringExpenseTable
              expenses={expenses}
              onToggle={loadExpenses}
            />
          )}
        </CardContent>
      </Card>

      <AddRecurringExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleExpenseAdded}
      />
    </div>
  )
}
