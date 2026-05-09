"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Tags, Trash2, Plus, Pencil, X } from "lucide-react"

import { AppLayout } from "@/presentation/components/layout/AppLayout"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/ui/card"
import { createCategorySchema, type CreateCategoryDTO } from "@/application/dtos/category.dto"
import { DeleteConfirmDialog } from "@/presentation/components/expenses/DeleteConfirmDialog"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryDTO>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      color: "#f97316" // Orange 500 default
    }
  })

  const PREDEFINED_COLORS = [
    "#f97316", // Laranja
    "#3b82f6", // Azul
    "#22c55e", // Verde
    "#eab308", // Amarelo
    "#8b5cf6", // Roxo
  ];
  
  const selectedColor = watch("color");

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setValue("name", category.name)
    setValue("color", category.color)
    setErrorMsg("")
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    reset({ color: "#f97316", name: "" })
    setErrorMsg("")
  }

  const onSubmit = async (data: CreateCategoryDTO) => {
    setErrorMsg("")
    try {
      const isEditing = !!editingCategory
      const url = isEditing ? `/api/categories/${editingCategory.id}` : "/api/categories"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || (isEditing ? "Erro ao editar categoria" : "Erro ao criar categoria"))
      }

      setEditingCategory(null)
      reset({ color: "#f97316", name: "" })
      fetchCategories()
    } catch (error: any) {
      setErrorMsg(error.message)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return
    
    const res = await fetch(`/api/categories/${categoryToDelete}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Erro ao excluir categoria")
    }

    setCategoryToDelete(null)
    if (editingCategory?.id === categoryToDelete) {
      handleCancelEdit()
    }
    fetchCategories()
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Categorias</h1>
        <p className="text-sm text-slate-500">Gerencie as categorias para organizar suas despesas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-sm font-medium bg-rose-50 text-rose-600 rounded-md border border-rose-200">
                    {errorMsg}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name" error={!!errors.name}>Nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Ferramentas"
                    error={!!errors.name}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  <Label error={!!errors.color}>Cor de Identificação</Label>
                  <div className="flex gap-4 items-center py-2 px-1">
                    {PREDEFINED_COLORS.map((color) => (
                      <label key={color} className="cursor-pointer relative flex-shrink-0">
                        <input
                          type="radio"
                          value={color}
                          className="sr-only"
                          {...register("color")}
                        />
                        <div 
                          className={`w-8 h-8 rounded-full transition-all duration-200 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-md' : 'ring-1 ring-slate-200 hover:scale-110 opacity-70 hover:opacity-100 hover:shadow-sm'}`}
                          style={{ backgroundColor: color }}
                        />
                      </label>
                    ))}
                  </div>
                  {errors.color && (
                    <p className="text-xs text-rose-500">{errors.color.message}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                    {editingCategory ? (
                      <>
                        <Pencil className="mr-2 h-4 w-4" />
                        Salvar
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar
                      </>
                    )}
                  </Button>
                  
                  {editingCategory && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tags className="h-5 w-5 text-slate-500" />
                Suas Categorias
              </CardTitle>
              <CardDescription>
                Categorias criadas para organizar as despesas da obra.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-12">
                  <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-3">
                    <Tags className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Nenhuma categoria</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Você ainda não possui categorias personalizadas. Crie uma nova categoria ao lado para começar a organizar.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-1">
                  {categories.map((category) => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center bg-opacity-10"
                          style={{ backgroundColor: `${category.color}15` }}
                        >
                          <Tags className="h-5 w-5" style={{ color: category.color }} />
                        </div>
                        <span className="font-medium text-slate-700">{category.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-slate-400 hover:text-orange-600 hover:bg-orange-50 p-2 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCategoryToDelete(category.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-md transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteConfirmDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Categoria"
        description="Tem certeza que deseja excluir esta categoria? As despesas vinculadas a ela perderão a associação."
      />
    </AppLayout>
  )
}
