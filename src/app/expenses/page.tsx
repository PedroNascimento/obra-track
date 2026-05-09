"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Filter } from "lucide-react"

import { AppLayout } from "@/presentation/components/layout/AppLayout"
import { ExpenseTable } from "@/presentation/components/expenses/ExpenseTable"
import { ExpenseSlideOver } from "@/presentation/components/expenses/ExpenseSlideOver"
import { DeleteConfirmDialog } from "@/presentation/components/expenses/DeleteConfirmDialog"
import { Button } from "@/presentation/components/ui/button"
import { Select } from "@/presentation/components/ui/select"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("total")
  
  // Slide Over state
  const [isSlideOpen, setIsSlideOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  
  // Delete Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      // Build query string
      const params = new URLSearchParams()
      if (filterType) params.append("type", filterType)
      if (filterPeriod) params.append("period", filterPeriod)
      
      const res = await fetch(`/api/expenses?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setExpenses(data.expenses || [])
      }
    } catch (error) {
      console.error("Erro ao carregar despesas:", error)
    } finally {
      setLoading(false)
    }
  }, [filterType, filterPeriod])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const handleOpenNew = () => {
    setEditingExpense(null)
    setIsSlideOpen(true)
  }

  const handleOpenEdit = (expense: any) => {
    setEditingExpense(expense)
    setIsSlideOpen(true)
  }

  const handleOpenDelete = (id: string) => {
    setExpenseToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return
    
    const res = await fetch(`/api/expenses/${expenseToDelete}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Erro ao excluir despesa")
    }

    setExpenseToDelete(null)
    fetchExpenses()
  }

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Despesas</h1>
          <p className="text-sm text-slate-500">Gerencie todos os gastos da sua obra</p>
        </div>
        
        <Button onClick={handleOpenNew} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center text-slate-500 gap-2 font-medium text-sm">
          <Filter size={18} />
          Filtros:
        </div>
        
        <div className="w-full sm:w-48">
          <Select 
            value={filterPeriod} 
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="total">Todo o período</option>
            <option value="monthly">Este Mês</option>
            <option value="weekly">Esta Semana</option>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Todos os tipos</option>
            <option value="material">Material</option>
            <option value="pedreiro">Pedreiro</option>
            <option value="servente">Servente</option>
            <option value="alimentacao">Alimentação</option>
            <option value="combustivel">Combustível</option>
            <option value="outro">Outro</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <ExpenseTable 
          expenses={expenses.map(e => ({
            ...e,
            date: e.expenseDate,
            categoryName: e.category?.name
          }))} 
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      <ExpenseSlideOver 
        isOpen={isSlideOpen}
        onClose={() => setIsSlideOpen(false)}
        onSuccess={() => fetchExpenses()}
        expense={editingExpense}
      />

      <DeleteConfirmDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Despesa"
        description="Tem certeza que deseja excluir esta despesa permanentemente?"
      />
    </AppLayout>
  )
}
