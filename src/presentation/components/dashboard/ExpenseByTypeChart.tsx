"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card"

interface ExpenseByTypeChartProps {
  data: {
    type: string
    amount: number
  }[]
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#64748b']

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

export function ExpenseByTypeChart({ data }: ExpenseByTypeChartProps) {
  const formattedData = data.map(item => ({
    name: translateType(item.type),
    value: Number(item.amount)
  }))

  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Despesas por Tipo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Nenhum dado disponível para o período.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
