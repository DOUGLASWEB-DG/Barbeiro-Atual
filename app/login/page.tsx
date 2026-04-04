'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Scissors, Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Falha no login')
        return
      }

      toast.success(`Bem-vindo, ${data.user.name}!`)
      router.push(redirect)
      router.refresh()
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl mb-4">
            <Scissors className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-foreground">BarberOS</h1>
          <p className="text-sm text-muted-foreground mt-1">Sistema de Gestão</p>
        </div>

        {/* Card de Login */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Entrar</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Acesse o painel administrativo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground font-medium">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@barberos.com"
                required
                autoComplete="email"
                autoFocus
                className="bg-input border-border text-foreground placeholder:text-muted-foreground h-11"
              />
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground font-medium">Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão */}
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 gap-2 font-medium mt-2"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Dica */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Credenciais padrão: <span className="text-foreground font-medium">admin@barberos.com</span> / <span className="text-foreground font-medium">admin123</span>
            </p>
          </div>
        </div>

        {/* Link para voltar */}
        <div className="text-center mt-4">
          <a href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← Voltar para o site
          </a>
        </div>
      </div>
    </div>
  )
}
