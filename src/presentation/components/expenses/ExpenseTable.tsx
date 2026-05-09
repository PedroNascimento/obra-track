"use client"

import { Edit, Trash2 } from "lucide-react"

interface ExpenseTableProps {
  expenses: {
    id: string
    description: string
    amount: number
    date: string
    type: string
    categoryName?: string
  }[]
  onEdit: (expense: any) => void
  onDelete: (id: string) => void
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

export function ExpenseTable({ expenses, onEdit, onDelete }: ExpenseTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200 border-dashed">
        <p className="text-slate-500 font-medium mb-2">Nenhuma despesa encontrada</p>
        <p className="text-sm text-slate-400 text-center">
          Tente mudar os filtros ou adicione uma nova despesa clicando no botão acima.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">Data</th>
              <th className="px-6 py-4 font-semibold">Descrição</th>
              <th className="px-6 py-4 font-semibold">Categoria</th>
              <th className="px-6 py-4 font-semibold">Tipo</th>
              <th className="px-6 py-4 font-semibold text-right">Valor</th>
              <th className="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                  {formatDate(expense.date)}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {expense.description}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {expense.categoryName || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    {translateType(expense.type)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-rose-600 whitespace-nowrap">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => onEdit(expense)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 p-1 rounded hover:bg-indigo-50 transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(expense.id)}
                    className="text-rose-600 hover:text-rose-900 p-1 rounded hover:bg-rose-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
