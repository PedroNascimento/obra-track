import { DollarSign, Hash, Calendar, PieChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import type { FinancialSummary } from "@/domain/repositories/expense.repository"

interface SummaryCardsProps {
  summary: FinancialSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Obter o tipo com maior gasto
  const highestType = summary.byType.length > 0 
    ? summary.byType.reduce((prev, current) => (prev.total > current.total) ? prev : current)
    : { type: 'N/A', total: 0 }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
          <DollarSign className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
          <p className="text-xs text-slate-500 mt-1">{summary.periodLabel}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quantidade</CardTitle>
          <Hash className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalCount}</div>
          <p className="text-xs text-slate-500 mt-1">Despesas registradas</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dias com Gastos</CardTitle>
          <Calendar className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.timeline.length}</div>
          <p className="text-xs text-slate-500 mt-1">No período selecionado</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maior Categoria</CardTitle>
          <PieChart className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{highestType.type}</div>
          <p className="text-xs text-slate-500 mt-1">{formatCurrency(highestType.total)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
