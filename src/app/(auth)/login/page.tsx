"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HardHat } from "lucide-react"

import { loginSchema, type LoginDTO } from "@/application/dtos/auth.dto"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginDTO) => {
    setErrorMsg("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Erro ao fazer login")
      }

      router.push("/dashboard")
      router.refresh()
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
          <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" error={!!errors.password}>Senha</Label>
              </div>
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
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Não tem uma conta?{" "}
            <Link href="/register" className="font-semibold text-orange-500 hover:text-orange-600">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
