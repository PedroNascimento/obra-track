"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/presentation/components/layout/AppLayout"
import { SummaryCards } from "@/presentation/components/dashboard/SummaryCards"
import { ExpenseByTypeChart } from "@/presentation/components/dashboard/ExpenseByTypeChart"
import { ExpenseByCategoryChart } from "@/presentation/components/dashboard/ExpenseByCategoryChart"
import { ExpenseTimelineChart } from "@/presentation/components/dashboard/ExpenseTimelineChart"
import { RecentExpensesTable } from "@/presentation/components/dashboard/RecentExpensesTable"
import { Select } from "@/presentation/components/ui/select"
import type { FinancialSummary } from "@/domain/repositories/expense.repository"

export default function DashboardPage() {
  const [filter, setFilter] = useState("monthly")
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [recentExpenses, setRecentExpenses] = useState<any[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      try {
        const [summaryRes, expensesRes] = await Promise.all([
          fetch(`/api/expenses/summary?period=${filter}`),
          fetch(`/api/expenses?limit=5`)
        ])

        if (summaryRes.ok) {
          const data = await summaryRes.json()
          setSummary(data.summary)
        }

        if (expensesRes.ok) {
          const data = await expensesRes.json()
          setRecentExpenses(data.expenses ? data.expenses.slice(0, 5) : [])
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [filter])

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Visão geral financeira da sua obra</p>
        </div>
        
        <div className="w-full sm:w-48">
          <Select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            disabled={loading}
          >
            <option value="weekly">Esta Semana</option>
            <option value="monthly">Este Mês</option>
            <option value="total">Total Geral</option>
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
      ) : summary ? (
        <div className="space-y-6">
          <SummaryCards summary={summary} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ExpenseByTypeChart data={summary.byType.map(t => ({ type: t.type, amount: t.total }))} />
            <ExpenseByCategoryChart data={summary.byCategory.map(c => ({ 
              categoryName: c.categoryName || 'Sem categoria', 
              color: c.categoryColor || '#cbd5e1', 
              amount: c.total 
            }))} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ExpenseTimelineChart data={summary.timeline.map(t => ({ date: t.date, amount: t.total }))} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentExpensesTable expenses={recentExpenses.map(e => ({
              id: e.id,
              description: e.description,
              amount: e.amount,
              date: e.expenseDate,
              type: e.type
            }))} />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          Não foi possível carregar os dados.
        </div>
      )}
    </AppLayout>
  )
}
