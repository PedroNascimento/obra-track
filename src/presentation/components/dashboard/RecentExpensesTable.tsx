"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card"

interface RecentExpensesTableProps {
  expenses: {
    id: string
    description: string
    amount: number
    date: string
    type: string
  }[]
}

const translateType = (type: string) => {
  const map: Record<string, string> = {
    material: "Material",
    pedreiro: "Pedreiro",
    servente: "Servente",
    alimentacao: "Alimentação",
    combustivel: "Combustível",
    outro: "Outro"
  }
  return map[type] || type
}

export function RecentExpensesTable({ expenses }: RecentExpensesTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Despesas Recentes</CardTitle>
        <CardDescription>
          As últimas 5 despesas registradas nesta obra.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="flex h-[150px] items-center justify-center text-sm text-slate-500">
            Nenhuma despesa registrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {expense.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        {translateType(expense.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-rose-600 whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
