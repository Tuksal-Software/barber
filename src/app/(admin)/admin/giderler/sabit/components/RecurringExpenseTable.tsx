"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { RecurringExpenseItem } from "@/lib/actions/recurring-expense.actions"
import { formatDateTimeTR } from "@/lib/time/formatDate"
import { toggleRecurringExpense } from "@/lib/actions/recurring-expense.actions"
import { toast } from "sonner"

interface RecurringExpenseTableProps {
  expenses: RecurringExpenseItem[]
  onToggle: () => void
}

const categoryLabels: Record<string, string> = {
  rent: "Kira",
  electricity: "Elektrik",
  water: "Su",
  product: "Ürün",
  staff: "Personel",
  other: "Diğer",
}

const categoryColors: Record<string, string> = {
  rent: "bg-red-500/10 text-red-700 dark:text-red-400",
  electricity: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  water: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  product: "bg-green-500/10 text-green-700 dark:text-green-400",
  staff: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
}

const repeatTypeLabels: Record<string, string> = {
  daily: "Günlük",
  weekly: "Haftalık",
  monthly: "Aylık",
}

function getRepeatLabel(repeatType: string, repeatInterval: number): string {
  const typeLabel = repeatTypeLabels[repeatType] || repeatType
  return `Her ${repeatInterval} ${typeLabel.toLowerCase()}`
}

export function RecurringExpenseTable({ expenses, onToggle }: RecurringExpenseTableProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(parseFloat(amount))
  }

  const handleToggle = async (id: string, currentValue: boolean) => {
    const newValue = !currentValue
    const result = await toggleRecurringExpense(id, newValue)
    
    if (result.success) {
      toast.success(newValue ? "Sabit gider aktif edildi" : "Sabit gider pasif edildi")
      onToggle()
    } else {
      toast.error(result.error || "İşlem sırasında hata oluştu")
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Henüz sabit gider tanımlanmamış.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Başlık</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Tutar</TableHead>
            <TableHead>Tekrar</TableHead>
            <TableHead>Sonraki Çalışma</TableHead>
            <TableHead>Durum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                {expense.title}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={categoryColors[expense.category] || ""}
                >
                  {categoryLabels[expense.category] || expense.category}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(expense.amount)}
              </TableCell>
              <TableCell>
                {getRepeatLabel(expense.repeatType, expense.repeatInterval)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDateTimeTR(expense.nextRunAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={expense.isActive}
                    onCheckedChange={() => handleToggle(expense.id, expense.isActive)}
                  />
                  <Badge
                    variant={expense.isActive ? "default" : "secondary"}
                    className={expense.isActive ? "" : "bg-gray-500/10 text-gray-500"}
                  >
                    {expense.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
