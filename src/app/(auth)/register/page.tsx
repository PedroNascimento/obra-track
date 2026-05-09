"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HardHat } from "lucide-react"

import { registerSchema, type RegisterDTO } from "@/application/dtos/auth.dto"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"

export default function RegisterPage() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterDTO>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterDTO) => {
    setErrorMsg("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Erro ao fazer cadastro")
      }

      router.push("/login?registered=true")
    } catch (error: any) {
      setErrorMsg(error.message)
    }
  }

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
          <HardHat size={28} />
        </div>
      </div>
      
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>
            Preencha seus dados para começar a gerenciar sua obra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-sm font-medium bg-rose-50 text-rose-600 rounded-md border border-rose-200">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" error={!!errors.name}>Nome completo</Label>
              <Input
                id="name"
                placeholder="João da Silva"
                error={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" error={!!errors.email}>E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                error={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" error={!!errors.password}>Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                error={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-rose-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Cadastrar
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-semibold text-orange-500 hover:text-orange-600">
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
