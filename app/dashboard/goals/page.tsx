'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { format, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Target,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  CalendarCheck,
  Trophy,
} from 'lucide-react'
import { toast } from 'sonner'
import { confirmAction } from '@/lib/confirm-toast'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { GoalFormModal } from '@/components/goals/goal-form-modal'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const goalTypeConfig = {
  REVENUE: { label: 'Receita', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  CLIENTS: { label: 'Novos Clientes', icon: Users, color: 'text-info', bg: 'bg-info/10 border-info/20' },
  APPOINTMENTS: { label: 'Agendamentos', icon: CalendarCheck, color: 'text-success', bg: 'bg-success/10 border-success/20' },
}

const periodLabels: Record<string, string> = {
  daily: 'diária',
  weekly: 'semanal',
  monthly: 'mensal',
}

export default function GoalsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { data: goals, mutate } = useSWR('/api/goals', fetcher)
  const { data: financeData } = useSWR('/api/dashboard', fetcher)

  async function deleteGoal(id: string) {
    const ok = await confirmAction({
      title: 'Excluir esta meta?',
      confirmLabel: 'Excluir',
    })
    if (!ok) return
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' })
      mutate()
      toast.success('Meta excluída')
    } catch {
      toast.error('Falha ao excluir meta')
    }
  }

  function getProgress(goal: any): number {
    if (!financeData) return 0
    const now = new Date()
    const isActiveGoal = isWithinInterval(now, {
      start: new Date(goal.startDate),
      end: new Date(goal.endDate),
    })
    if (!isActiveGoal) return 0

    let current = 0
    if (goal.type === 'REVENUE') {
      current = goal.period === 'daily'
        ? financeData.revenue.daily
        : goal.period === 'weekly'
        ? financeData.revenue.weekly
        : financeData.revenue.monthly
    } else if (goal.type === 'CLIENTS') {
      current = financeData.totalClients
    } else if (goal.type === 'APPOINTMENTS') {
      current = financeData.appointmentStats?.total ?? 0
    }

    return Math.min((current / goal.targetAmount) * 100, 100)
  }

  function isActive(goal: any) {
    return isWithinInterval(new Date(), {
      start: new Date(goal.startDate),
      end: new Date(goal.endDate),
    })
  }

  const activeGoals = goals?.filter((g: any) => isActive(g)) ?? []
  const pastGoals = goals?.filter((g: any) => !isActive(g)) ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif text-foreground">Metas</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Acompanhe seus objetivos de negócio</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </Button>
      </div>

      {/* Metas Ativas */}
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Metas Ativas
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeGoals.map((goal: any) => {
              const config = goalTypeConfig[goal.type as keyof typeof goalTypeConfig]
              const Icon = config.icon
              const progress = getProgress(goal)
              const isCompleted = progress >= 100

              return (
                <div
                  key={goal.id}
                  className={cn(
                    'bg-card border rounded-xl p-5 flex flex-col gap-4 group transition-colors',
                    isCompleted ? 'border-primary/40' : 'border-border hover:border-border/80'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-lg border flex items-center justify-center shrink-0', config.bg)}>
                        <Icon className={cn('w-5 h-5', config.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{goal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Meta {periodLabels[goal.period] || goal.period} · {config.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <Trophy className="w-4 h-4 text-primary" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGoal(goal.id)}
                        className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Progresso */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className={cn('text-2xl font-bold', isCompleted ? 'text-primary' : 'text-foreground')}>
                        {progress.toFixed(0)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Meta: {goal.type === 'REVENUE' ? 'R$' : ''}{goal.targetAmount.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className={cn('h-3', isCompleted ? 'bg-primary/20' : 'bg-secondary')}
                    />
                    {isCompleted && (
                      <p className="text-xs text-primary font-medium text-center">Meta alcançada! 🎉</p>
                    )}
                  </div>

                  {/* Datas */}
                  <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                    <span>{format(new Date(goal.startDate), "d 'de' MMM", { locale: ptBR })}</span>
                    <span>Termina em {format(new Date(goal.endDate), "d 'de' MMM 'de' yyyy", { locale: ptBR })}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Metas Passadas */}
      {pastGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Metas Anteriores</h3>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {pastGoals.map((goal: any) => {
              const config = goalTypeConfig[goal.type as keyof typeof goalTypeConfig]
              const Icon = config.icon
              return (
                <div key={goal.id} className="flex items-center gap-4 px-5 py-3.5 group">
                  <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 opacity-60', config.bg)}>
                    <Icon className={cn('w-4 h-4', config.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{goal.title}</p>
                    <p className="text-xs text-muted-foreground/70">
                      {format(new Date(goal.startDate), "d 'de' MMM", { locale: ptBR })} – {format(new Date(goal.endDate), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Meta: {goal.type === 'REVENUE' ? 'R$' : ''}{goal.targetAmount}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteGoal(goal.id)}
                    className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {(!goals || goals.length === 0) && (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground mb-1">Nenhuma meta definida</p>
          <p className="text-sm text-muted-foreground">Defina metas de receita, clientes ou agendamentos</p>
          <Button
            onClick={() => setModalOpen(true)}
            className="mt-4 bg-primary text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" /> Criar Primeira Meta
          </Button>
        </div>
      )}

      <GoalFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { mutate(); setModalOpen(false) }}
      />
    </div>
  )
}
