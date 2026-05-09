"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/presentation/components/ui/button"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title?: string
  description?: string
}

export function DeleteConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Excluir item",
  description = "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsDeleting(true)
    setError("")
    try {
      await onConfirm()
      onClose()
    } catch (err: any) {
      setError(err.message || "Erro ao excluir")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative z-50">
      <div 
        className="fixed inset-0 bg-slate-900/80 transition-opacity" 
        onClick={!isDeleting ? onClose : undefined}
      />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-rose-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-slate-900">
                    {title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-slate-500">
                      {description}
                    </p>
                  </div>
                  {error && (
                    <div className="mt-4 p-2 text-sm text-rose-600 bg-rose-50 rounded border border-rose-200">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <Button 
                variant="destructive" 
                className="w-full sm:ml-3 sm:w-auto"
                onClick={handleConfirm}
                isLoading={isDeleting}
              >
                Excluir
              </Button>
              <Button 
                variant="outline" 
                className="mt-3 w-full sm:mt-0 sm:w-auto"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
