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
import type { ExpenseItem } from "@/lib/actions/expense.actions"
import { formatDateTimeLongTR } from "@/lib/time/formatDate"

interface ExpenseTableProps {
  expenses: ExpenseItem[]
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

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(parseFloat(amount))
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Bu tarih için gider bulunamadı
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategori</TableHead>
            <TableHead>Tutar</TableHead>
            <TableHead>Açıklama</TableHead>
            <TableHead>Oluşturulma</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} className="hover:bg-muted/50">
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
              <TableCell className="max-w-xs truncate">
                {expense.description || "-"}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDateTimeLongTR(expense.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
