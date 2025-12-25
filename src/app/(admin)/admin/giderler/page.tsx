"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import {
  getExpensesByDate,
  getExpenseDayTotal,
} from "@/lib/actions/expense.actions"
import { AddExpenseDialog } from "./components/AddExpenseDialog"
import { ExpenseTable } from "./components/ExpenseTable"
import type { ExpenseItem } from "@/lib/actions/expense.actions"
import { toast } from "sonner"

export const dynamic = 'force-dynamic'

export default function GiderlerPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [dayTotal, setDayTotal] = useState<string>("0")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadExpenseData()
  }, [selectedDate])

  const loadExpenseData = async () => {
    setLoading(true)
    try {
      const [expensesData, totalData] = await Promise.all([
        getExpensesByDate(selectedDate),
        getExpenseDayTotal(selectedDate),
      ])
      setExpenses(expensesData)
      setDayTotal(totalData)
    } catch (error) {
      console.error("Error loading expense data:", error)
      toast.error("Veriler yüklenirken hata oluştu")
      setExpenses([])
      setDayTotal("0")
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseAdded = () => {
    loadExpenseData()
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Tüm Tarihler"
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Dükkan Giderleri</h1>
        <p className="text-muted-foreground">Günlük gider takibi ve yönetimi</p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Gider Ekle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Günlük Toplam Gider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(dayTotal)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedDate ? `${formatDate(selectedDate)} tarihli giderler` : "Tüm giderler"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Günlük Giderler</CardTitle>
          {!loading && (
            <Input
              type="date"
              value={selectedDate ?? ''}
              onChange={(e) => setSelectedDate(e.target.value || null)}
              className="h-9 w-[160px] text-sm"
              placeholder="Tüm Tarihler"
            />
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Yükleniyor...
            </div>
          ) : (
            <ExpenseTable 
              expenses={expenses} 
            />
          )}
        </CardContent>
      </Card>

      <AddExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate || new Date().toISOString().split("T")[0]}
        onSuccess={handleExpenseAdded}
      />
    </div>
  )
}
