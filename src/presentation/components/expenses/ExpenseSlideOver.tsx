"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"

import { createExpenseSchema, type CreateExpenseDTO } from "@/application/dtos/create-expense.dto"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Select } from "@/presentation/components/ui/select"

interface ExpenseSlideOverProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  expense?: any // if provided, it's edit mode
}

export function ExpenseSlideOver({ isOpen, onClose, onSuccess, expense }: ExpenseSlideOverProps) {
  const [errorMsg, setErrorMsg] = useState("")
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
  
  const isEditing = !!expense

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateExpenseDTO>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      type: "material",
      amount: undefined as unknown as number,
      description: "",
      expenseDate: new Date().toISOString().split("T")[0],
    }
  })

  useEffect(() => {
    // Load categories
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    if (isOpen) {
      if (isEditing && expense) {
        reset({
          type: expense.type,
          categoryId: expense.categoryId || undefined,
          description: expense.description,
          amount: Number(expense.amount),
          expenseDate: new Date(expense.expenseDate).toISOString().split("T")[0],
        })
      } else {
        reset({
          type: "material",
          amount: undefined as unknown as number,
          description: "",
          expenseDate: new Date().toISOString().split("T")[0],
        })
      }
      setErrorMsg("")
    }
  }, [isOpen, isEditing, expense, reset])

  const onSubmit = async (data: CreateExpenseDTO) => {
    setErrorMsg("")
    try {
      const url = isEditing ? `/api/expenses/${expense.id}` : "/api/expenses"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Erro ao salvar despesa")
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      setErrorMsg(error.message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="relative z-50">
      <div 
        className="fixed inset-0 bg-slate-900/80 transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <div className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out">
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="bg-slate-50 px-4 py-6 sm:px-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-6 text-slate-900">
                      {isEditing ? "Editar Despesa" : "Nova Despesa"}
                    </h2>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        onClick={onClose}
                      >
                        <span className="sr-only">Fechar painel</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="relative flex-1 px-4 py-6 sm:px-6">
                  <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {errorMsg && (
                      <div className="p-3 text-sm font-medium bg-rose-50 text-rose-600 rounded-md border border-rose-200">
                        {errorMsg}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" error={!!errors.description}>Descrição</Label>
                      <Input
                        id="description"
                        placeholder="Ex: Cimento 50kg"
                        error={!!errors.description}
                        {...register("description")}
                      />
                      {errors.description && (
                        <p className="text-xs text-rose-500">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount" error={!!errors.amount}>Valor (R$)</Label>
                        <Controller
                          name="amount"
                          control={control}
                          render={({ field: { onChange, value } }) => {
                            const displayValue = value !== undefined && value !== null && !isNaN(value)
                              ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
                              : "";

                            return (
                              <Input
                                id="amount"
                                type="text"
                                inputMode="numeric"
                                placeholder="0,00"
                                error={!!errors.amount}
                                value={displayValue}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/\D/g, "");
                                  if (!raw) {
                                    onChange(undefined);
                                  } else {
                                    onChange(parseInt(raw, 10) / 100);
                                  }
                                }}
                              />
                            );
                          }}
                        />
                        {errors.amount && (
                          <p className="text-xs text-rose-500">{errors.amount.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expenseDate" error={!!errors.expenseDate}>Data</Label>
                        <Input
                          id="expenseDate"
                          type="date"
                          error={!!errors.expenseDate}
                          {...register("expenseDate")}
                        />
                        {errors.expenseDate && (
                          <p className="text-xs text-rose-500">{errors.expenseDate.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" error={!!errors.type}>Tipo</Label>
                      <Select id="type" error={!!errors.type} {...register("type")}>
                        <option value="material">Material</option>
                        <option value="pedreiro">Pedreiro</option>
                        <option value="servente">Servente</option>
                        <option value="alimentacao">Alimentação</option>
                        <option value="combustivel">Combustível</option>
                        <option value="outro">Outro</option>
                      </Select>
                      {errors.type && (
                        <p className="text-xs text-rose-500">{errors.type.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Categoria (Opcional)</Label>
                      <Select id="categoryId" {...register("categoryId")}>
                        <option value="">Selecione uma categoria...</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </Select>
                      {errors.categoryId && (
                        <p className="text-xs text-rose-500">{errors.categoryId.message}</p>
                      )}
                    </div>
                  </form>
                </div>
                
                <div className="flex shrink-0 justify-end gap-3 px-4 py-4 sm:px-6 border-t border-slate-200 bg-slate-50">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" form="expense-form" isLoading={isSubmitting}>
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
