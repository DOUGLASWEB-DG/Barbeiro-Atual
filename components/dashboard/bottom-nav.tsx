'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  DollarSign,
  Scissors,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const items = [
  {
    href: '/dashboard',
    label: 'Painel',
    icon: LayoutDashboard,
    match: (p: string) => p === '/dashboard',
  },
  {
    href: '/dashboard/appointments',
    label: 'Agenda',
    icon: CalendarDays,
    match: (p: string) => p.startsWith('/dashboard/appointments'),
  },
  {
    href: '/dashboard/clients',
    label: 'Clientes',
    icon: Users,
    match: (p: string) => p.startsWith('/dashboard/clients'),
  },
  {
    href: '/dashboard/finances',
    label: 'Finanças',
    icon: DollarSign,
    match: (p: string) => p.startsWith('/dashboard/finances'),
  },
  {
    href: '/dashboard/services',
    label: 'Serviços',
    icon: Scissors,
    match: (p: string) => p.startsWith('/dashboard/services'),
  },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const { data: alertData } = useSWR('/api/finances/alerts', fetcher, {
    refreshInterval: 60000,
  })
  const alertCount = alertData?.unreadCount ?? 0

  return (
    <nav
      className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0 z-50',
        'border-t border-white/10 bg-zinc-950/90 backdrop-blur-xl',
        'supports-[backdrop-filter]:bg-zinc-950/75',
        'pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-2 px-1',
        'shadow-[0_-12px_40px_rgba(0,0,0,0.45)]'
      )}
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="flex max-w-lg mx-auto items-stretch justify-between gap-0.5">
        {items.map((item) => {
          const Icon = item.icon
          const active = item.match(pathname)
          const showBadge = item.href === '/dashboard/finances' && alertCount > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl min-h-12 py-2 px-1',
                'transition-all duration-150 active:scale-[0.97] active:bg-white/5',
                active ? 'text-primary' : 'text-zinc-500'
              )}
            >
              <span className="relative inline-flex">
                <Icon
                  className={cn('w-6 h-6 shrink-0', active && 'text-primary')}
                  strokeWidth={active ? 2.25 : 2}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white tabular-nums">
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  'text-[10px] font-semibold leading-tight truncate max-w-[4.25rem] text-center',
                  active ? 'text-primary' : 'text-zinc-500'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
