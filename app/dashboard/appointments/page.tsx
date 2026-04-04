'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  CalendarDays,
  List,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  MessageCircle,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { confirmAction } from '@/lib/confirm-toast'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { AppointmentFormModal } from '@/components/appointments/appointment-form-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusFilters = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'CONFIRMED', label: 'Confirmados' },
  { value: 'COMPLETED', label: 'Concluídos' },
  { value: 'CANCELED', label: 'Cancelados' },
]

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED'

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<any>(null)

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const queryParams = `?date=${dateStr}&status=${statusFilter}`
  const { data: appointments, mutate } = useSWR(`/api/appointments${queryParams}`, fetcher)

  async function updateStatus(id: string, status: AppointmentStatus) {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      mutate()
      toast.success(`Agendamento marcado como ${status === 'CONFIRMED' ? 'confirmado' : status === 'COMPLETED' ? 'concluído' : 'cancelado'}`)
    } catch {
      toast.error('Falha ao atualizar agendamento')
    }
  }

  async function deleteAppointment(id: string) {
    const ok = await confirmAction({
      title: 'Excluir este agendamento?',
      confirmLabel: 'Excluir',
    })
    if (!ok) return
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
      mutate()
      toast.success('Agendamento excluído')
    } catch {
      toast.error('Falha ao excluir agendamento')
    }
  }

  function openWhatsApp(appt: any) {
    const phone = appt.client?.phone?.replace(/\D/g, '')
    const dateStr = format(new Date(appt.date), "d 'de' MMMM", { locale: ptBR })
    const time = format(new Date(appt.date), 'HH:mm')
    const msg = encodeURIComponent(
      `Olá ${appt.client?.name}! Este é um lembrete do seu agendamento de ${appt.service?.name} no dia ${dateStr} às ${time}. Até lá!`
    )
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold tracking-tight text-foreground">Agendamentos</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Gerencie sua agenda diária</p>
        </div>
        <Button
          onClick={() => { setEditingAppointment(null); setModalOpen(true) }}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
          className="min-h-12 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-sm text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="scrollbar-hide flex max-w-full snap-x snap-mandatory items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/80 p-1 touch-pan-x">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'shrink-0 snap-start rounded-lg px-4 py-2.5 text-xs font-semibold transition-all duration-150 active:scale-[0.98]',
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground active:bg-white/5'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-zinc-900/80 p-1">
          <button
            type="button"
            onClick={() => setView('list')}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-150 active:scale-95',
              view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground active:bg-white/5'
            )}
            aria-label="Lista"
          >
            <List className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-150 active:scale-95',
              view === 'calendar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground active:bg-white/5'
            )}
            aria-label="Calendário"
          >
            <CalendarDays className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Cabeçalho da Data */}
      <div className="flex items-center gap-3">
        <h3 className="text-base font-semibold text-foreground">
          {isSameDay(selectedDate, new Date()) ? 'Hoje — ' : ''}
          {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {appointments?.length ?? 0} agendamentos
        </span>
      </div>

      {/* Lista de Agendamentos — cards no mobile, lista densa no desktop */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm lg:rounded-2xl">
        {appointments && appointments.length > 0 ? (
          <div className="flex flex-col gap-3 p-3 lg:gap-0 lg:divide-y lg:divide-border lg:p-0">
            {appointments.map((appt: any) => (
              <div
                key={appt.id}
                className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/50 p-4 transition-all duration-150 active:scale-[0.99] active:bg-zinc-800/40 lg:flex-row lg:items-center lg:gap-4 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-5 lg:py-4 lg:hover:bg-secondary/20 lg:active:scale-100"
              >
                <div className="flex items-start gap-3 lg:items-center">
                  <div className="w-16 shrink-0 text-center">
                    <p className="text-base font-bold text-foreground">
                      {format(new Date(appt.date), 'HH:mm')}
                    </p>
                  </div>

                  <div className="relative hidden w-4 shrink-0 flex-col items-center self-stretch lg:flex">
                    <div
                      className={cn(
                        'mt-1 h-3 w-3 shrink-0 rounded-full border-2',
                        appt.status === 'COMPLETED'
                          ? 'border-success bg-success'
                          : appt.status === 'CONFIRMED'
                            ? 'border-info bg-info'
                            : appt.status === 'CANCELED'
                              ? 'border-muted-foreground bg-muted'
                              : 'border-warning bg-warning'
                      )}
                    />
                    <div className="mt-1 w-px flex-1 bg-border" />
                  </div>

                  <div className="min-w-0 flex-1 lg:flex-1">
                    <p className="text-sm font-semibold text-foreground">{appt.client?.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">{appt.service?.name}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {appt.service?.durationMins}min
                      </span>
                    </div>
                    {appt.notes && (
                      <p className="mt-1 text-xs italic text-muted-foreground">{appt.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3 lg:ml-auto lg:border-t-0 lg:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-primary">
                      R${appt.service?.price?.toFixed(2)}
                    </span>
                    <StatusBadge status={appt.status} />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100"
                        aria-label="Ações do agendamento"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem onClick={() => { setEditingAppointment(appt); setModalOpen(true) }} className="gap-2 cursor-pointer">
                      <Pencil className="w-4 h-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openWhatsApp(appt)} className="gap-2 cursor-pointer text-success">
                      <MessageCircle className="w-4 h-4" /> Enviar WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {appt.status !== 'CONFIRMED' && (
                      <DropdownMenuItem onClick={() => updateStatus(appt.id, 'CONFIRMED')} className="gap-2 cursor-pointer">
                        <CheckCircle2 className="w-4 h-4" /> Confirmar
                      </DropdownMenuItem>
                    )}
                    {appt.status !== 'COMPLETED' && (
                      <DropdownMenuItem onClick={() => updateStatus(appt.id, 'COMPLETED')} className="gap-2 cursor-pointer text-success">
                        <CheckCircle2 className="w-4 h-4" /> Marcar Concluído
                      </DropdownMenuItem>
                    )}
                    {appt.status !== 'CANCELED' && (
                      <DropdownMenuItem onClick={() => updateStatus(appt.id, 'CANCELED')} className="gap-2 cursor-pointer text-warning">
                        <XCircle className="w-4 h-4" /> Cancelar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => deleteAppointment(appt.id)} className="gap-2 cursor-pointer text-destructive">
                      <Trash2 className="w-4 h-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-base font-semibold text-foreground mb-1">Sem agendamentos</p>
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento para esta data
            </p>
            <Button
              onClick={() => { setEditingAppointment(null); setModalOpen(true) }}
              variant="outline"
              className="mt-4 border-border gap-2"
            >
              <Plus className="w-4 h-4" /> Agendar Horário
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <AppointmentFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingAppointment(null) }}
        appointment={editingAppointment}
        onSaved={() => { mutate(); setModalOpen(false); setEditingAppointment(null) }}
        defaultDate={selectedDate}
      />
    </div>
  )
}
