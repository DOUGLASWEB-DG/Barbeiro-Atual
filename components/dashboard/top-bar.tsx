'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Bell, MoreHorizontal, Globe, LogOut, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TopBarProps {
  onMenuToggle: () => void
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Painel',
  '/dashboard/appointments': 'Agendamentos',
  '/dashboard/clients': 'Clientes',
  '/dashboard/finances': 'Controle Financeiro',
  '/dashboard/goals': 'Metas',
  '/dashboard/services': 'Serviços',
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname()
  const title = pageTitles[pathname] ?? 'BarberOS'
  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-zinc-950/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/70 lg:h-16 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="hidden shrink-0 text-muted-foreground lg:flex"
          aria-label="Alternar menu lateral"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold tracking-tight text-foreground lg:text-lg">
            {title}
          </h1>
          <p className="hidden text-xs capitalize text-muted-foreground sm:block">{today}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        
        <Button
          variant="ghost"
          size="icon"
          className="hidden text-muted-foreground sm:flex"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground lg:hidden"
              aria-label="Mais opções"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-2xl border border-white/10 bg-zinc-900/95 p-1 backdrop-blur-xl"
          >
            <DropdownMenuItem asChild className="min-h-12 rounded-xl">
              <Link href="/dashboard/goals" className="cursor-pointer gap-3">
                <Target className="h-5 w-5 shrink-0" />
                Metas
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="min-h-12 rounded-xl">
              <Link href="/book" target="_blank" rel="noopener noreferrer" className="cursor-pointer gap-3">
                <Globe className="h-5 w-5 shrink-0" />
                Página de agendamento
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="min-h-12 cursor-pointer gap-3 rounded-xl text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
