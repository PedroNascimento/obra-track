"use client"

import { useState } from "react"
import { Download, FileText } from "lucide-react"

import { AppLayout } from "@/presentation/components/layout/AppLayout"
import { Button } from "@/presentation/components/ui/button"
import { Select } from "@/presentation/components/ui/select"
import { Label } from "@/presentation/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"

export default function ReportsPage() {
  const [filterPeriod, setFilterPeriod] = useState("all")
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    setErrorMsg("")
    
    try {
      const params = new URLSearchParams()
      if (filterPeriod !== "all") params.append("filter", filterPeriod)
        
      const res = await fetch(`/api/reports/pdf?${params.toString()}`)
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Erro ao gerar PDF")
      }

      // Convert response to blob
      const blob = await res.blob()
      
      // Create object URL and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `obratrack-relatorio-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
        <p className="text-sm text-slate-500">Exporte seus dados financeiros para PDF</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Relatório de Despesas
            </CardTitle>
            <CardDescription>
              Gere um relatório em PDF contendo o resumo financeiro, totais por categoria e a lista completa de despesas do período selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMsg && (
              <div className="p-3 text-sm font-medium bg-rose-50 text-rose-600 rounded-md border border-rose-200">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-3">
              <Label>Período do Relatório</Label>
              <Select 
                value={filterPeriod} 
                onChange={(e) => setFilterPeriod(e.target.value)}
              >
                <option value="all">Todo o período da obra</option>
                <option value="monthly">Este Mês</option>
                <option value="weekly">Esta Semana</option>
              </Select>
            </div>

            <Button 
              onClick={handleGeneratePDF} 
              isLoading={isGenerating}
              className="w-full"
            >
              {!isGenerating && <Download className="mr-2 h-4 w-4" />}
              {isGenerating ? "Gerando Documento..." : "Baixar PDF"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
