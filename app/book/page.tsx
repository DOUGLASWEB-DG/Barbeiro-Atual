'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { format, addDays, isBefore, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Scissors,
  Clock,
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  User,
  Phone,
  CalendarDays,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const WHATSAPP_NUMBER = '5569981050573'

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
]

type Step = 'service' | 'datetime' | 'details' | 'success'

interface BookingData {
  serviceId: string
  serviceName: string
  servicePrice: number
  serviceDuration: number
  date: string
  time: string
  name: string
  phone: string
  notes: string
}

function buildWhatsAppLink(data: Partial<BookingData>) {
  const msg = data.serviceName
    ? `Olá! Gostaria de agendar um(a) *${data.serviceName}*${data.date ? ` no dia *${format(new Date(data.date + 'T12:00:00'), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}*` : ''}${data.time ? ` às *${data.time}*` : ''}. Esse horário está disponível?`
    : `Olá! Gostaria de agendar um horário. Quais horários estão disponíveis?`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
}

export default function BookingPage() {
  const [step, setStep] = useState<Step>('service')
  const [booking, setBooking] = useState<Partial<BookingData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmedId, setConfirmedId] = useState<string | null>(null)

  const { data: services, isLoading: loadingServices } = useSWR<any[]>('/api/book', fetcher)

  // Gerar datas disponíveis (próximos 14 dias, sem domingos)
  const today = startOfToday()
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(today, i + 0)).filter(
    (d) => d.getDay() !== 0
  )

  async function submit(details: { name: string; phone: string; notes: string }) {
    if (!booking.serviceId || !booking.date || !booking.time) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: details.name,
          phone: details.phone,
          notes: details.notes,
          serviceId: booking.serviceId,
          date: booking.date,
          time: booking.time,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Falha de validação.')
      }

      const result = await res.json()
      setConfirmedId(result.appointment?.id)
      setStep('success')
      toast.success('Sucesso!', { description: 'Seu horário foi reservado.' })
    } catch (err: any) {
      toast.error('Erro', { description: err.message || 'Falha ao realizar agendamento.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Header Premium (App-like) */}
      <header className="h-16 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 transition-transform active:scale-95">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Scissors className="w-4 h-4 text-zinc-950" />
          </div>
          <span className="text-lg font-bold font-serif tracking-tight text-foreground">BARBER OS</span>
        </Link>
        <a
          href={buildWhatsAppLink(booking)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="border-success/20 bg-success/10 text-success hover:bg-success/20 gap-2 h-9 rounded-xl">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Dúvidas?</span>
          </Button>
        </a>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col animate-fade-in">
        {/* Indicador de progresso */}
        {step !== 'success' && (
          <div className="flex items-center justify-between mb-10 px-2">
            {(['service', 'datetime', 'details'] as const).map((s, i) => {
              const stepLabels = { service: 'Serviço', datetime: 'Horário', details: 'Dados' }
              const stepIndex = ['service', 'datetime', 'details'].indexOf(step)
              const thisIndex = i
              const done = thisIndex < stepIndex
              const active = thisIndex === stepIndex
              return (
                <div key={s} className="flex items-center gap-3 flex-1 last:flex-none">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0',
                    done ? 'bg-primary text-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]' :
                    active ? 'border-2 border-primary text-primary bg-primary/10' :
                    'border-2 border-white/10 text-muted-foreground bg-zinc-900/50'
                  )}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    'text-xs font-semibold uppercase tracking-wider hidden sm:block',
                    active ? 'text-foreground' : done ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {stepLabels[s]}
                  </span>
                  {i < 2 && (
                    <div className="flex-1 h-[2px] mx-2 rounded-full overflow-hidden bg-white/5">
                      <div className={cn("h-full transition-all duration-500", done ? "bg-primary w-full" : "w-0")} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* PASSO 1 — Seleção de Serviço */}
        {step === 'service' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center sm:text-left mb-8">
              <h1 className="text-3xl font-bold font-serif text-foreground">O que vamos fazer hoje?</h1>
              <p className="text-base text-muted-foreground mt-2">Selecione o serviço desejado para continuar.</p>
            </div>

            {loadingServices ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Carregando catálogo...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {services?.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => {
                      setBooking({
                        ...booking,
                        serviceId: svc.id,
                        serviceName: svc.name,
                        servicePrice: svc.price,
                        serviceDuration: svc.durationMins,
                      })
                      setTimeout(() => setStep('datetime'), 150) // Pequeno delay para mostrar animação de clique
                    }}
                    className={cn(
                      'w-full text-left bg-zinc-900/50 backdrop-blur-sm border rounded-2xl p-5 transition-all duration-200 group active:scale-[0.98]',
                      booking.serviceId === svc.id 
                        ? 'border-primary ring-1 ring-primary/50 bg-primary/5 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' 
                        : 'border-white/10 hover:border-white/20 hover:bg-zinc-900/80'
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          booking.serviceId === svc.id ? "bg-primary text-zinc-950" : "bg-primary/10 border border-primary/20 text-primary"
                        )}>
                          <Scissors className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-foreground truncate">{svc.name}</p>
                          {svc.description && (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{svc.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-primary">R${svc.price}</p>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground justify-end mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          {svc.durationMins} min
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {(!services || services.length === 0) && (
                  <div className="text-center py-16 bg-zinc-900/50 border border-white/10 rounded-3xl backdrop-blur-sm">
                    <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-base font-semibold text-foreground mb-1">Nenhum serviço disponível</p>
                    <p className="text-sm text-muted-foreground px-6">No momento não estamos aceitando agendamentos online.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PASSO 2 — Data e Hora */}
        {step === 'datetime' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 flex flex-col h-full">
            <div>
              <button
                onClick={() => setStep('service')}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4 bg-zinc-900/50 w-fit px-3 py-1.5 rounded-lg border border-white/5 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <h1 className="text-3xl font-bold font-serif text-foreground">Quando?</h1>
              <div className="flex items-center gap-2 mt-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 w-fit">
                <Scissors className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-primary">
                  {booking.serviceName} <span className="opacity-60 font-normal mx-1">•</span> R${booking.servicePrice} <span className="opacity-60 font-normal mx-1">•</span> {booking.serviceDuration}min
                </p>
              </div>
            </div>

            {/* Scroll Horizontal de Datas (App-like) */}
            <div>
              <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Escolha o Dia
              </p>
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {availableDates.map((date) => {
                  const val = format(date, 'yyyy-MM-dd')
                  const isSelected = booking.date === val
                  const isPast = isBefore(date, today)
                  return (
                    <button
                      key={val}
                      disabled={isPast}
                      onClick={() => setBooking({ ...booking, date: val, time: undefined })}
                      className={cn(
                        'flex flex-col items-center justify-center min-w-[72px] h-[88px] rounded-2xl border transition-all shrink-0 snap-center active:scale-95',
                        isSelected
                          ? 'bg-primary border-primary text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : isPast
                          ? 'border-white/5 bg-zinc-950/50 text-muted-foreground/30 cursor-not-allowed'
                          : 'border-white/10 bg-zinc-900/50 text-foreground hover:border-primary/50 hover:bg-primary/5'
                      )}
                    >
                      <span className={cn("text-xs font-semibold uppercase tracking-wider mb-1", isSelected ? "text-zinc-900" : "text-muted-foreground")}>
                        {format(date, 'EEE', { locale: ptBR })}
                      </span>
                      <span className="text-2xl font-bold leading-none">{format(date, 'd')}</span>
                      <span className={cn("text-xs font-medium mt-1", isSelected ? "text-zinc-800" : "text-muted-foreground")}>
                        {format(date, 'MMM', { locale: ptBR })}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Grid de Horários */}
            <div className={cn("transition-all duration-500", booking.date ? "opacity-100 translate-y-0" : "opacity-50 pointer-events-none translate-y-4")}>
              <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Escolha o Horário
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = booking.time === slot
                  return (
                    <button
                      key={slot}
                      onClick={() => setBooking({ ...booking, time: slot })}
                      className={cn(
                        'py-3 rounded-xl border text-sm font-bold transition-all active:scale-95',
                        isSelected
                          ? 'bg-primary border-primary text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'border-white/10 bg-zinc-900/50 text-foreground hover:border-primary/50 hover:bg-primary/5'
                      )}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-auto pt-8">
              <Button
                onClick={() => setStep('details')}
                disabled={!booking.date || !booking.time}
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all"
              >
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* PASSO 3 — Dados Pessoais */}
        {step === 'details' && (
          <DetailsStep
            booking={booking}
            onBack={() => setStep('datetime')}
            onSubmit={submit}
            isSubmitting={isSubmitting}
          />
        )}

        {/* PASSO 4 — Sucesso */}
        {step === 'success' && (
          <div className="text-center space-y-8 py-10 animate-in zoom-in-95 duration-500">
            <div className="relative w-28 h-28 mx-auto">
              <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
              <div className="relative w-full h-full bg-success border-4 border-zinc-950 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-14 h-14 text-zinc-950" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold font-serif text-foreground text-balance">
                Horário Confirmado!
              </h1>
              <p className="text-base text-muted-foreground mt-3 max-w-sm mx-auto">
                Tudo certo, {booking.name?.split(' ')[0]}! Te esperamos na barbearia.
              </p>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-left space-y-5 max-w-sm mx-auto shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <Scissors className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">{booking.serviceName}</p>
                  <p className="text-sm font-medium text-primary mt-0.5">R${booking.servicePrice}</p>
                </div>
              </div>
              
              <div className="h-px w-full bg-white/5" />
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <CalendarDays className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">
                    {booking.date && format(new Date(booking.date + 'T12:00:00'), "d 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">às {booking.time}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-sm mx-auto pt-4">
              <a
                href={buildWhatsAppLink(booking)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-success text-zinc-950 hover:bg-success/90 h-14 rounded-2xl text-base font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Receber no WhatsApp
                </Button>
              </a>
              <Button 
                variant="ghost" 
                onClick={() => window.location.reload()} 
                className="w-full text-muted-foreground hover:text-foreground h-14 rounded-2xl text-base font-semibold"
              >
                Fazer outro agendamento
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// --- Sub-componente de Dados ---
interface DetailsStepProps {
  booking: Partial<BookingData>
  onBack: () => void
  onSubmit: (data: { name: string; phone: string; notes: string }) => void
  isSubmitting: boolean
}

function DetailsStep({ booking, onBack, onSubmit, isSubmitting }: DetailsStepProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})

  function validate() {
    const e: typeof errors = {}
    if (!name.trim()) e.name = 'Como podemos te chamar?'
    if (!phone.trim()) e.phone = 'Precisamos do seu WhatsApp'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ name, phone, notes })
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 flex flex-col h-full">
      <div>
        <button onClick={onBack} disabled={isSubmitting} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4 bg-zinc-900/50 w-fit px-3 py-1.5 rounded-lg border border-white/5 active:scale-95 disabled:opacity-50">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <h1 className="text-3xl font-bold font-serif text-foreground">Quase lá!</h1>
        <p className="text-base text-muted-foreground mt-2">
          Só precisamos de alguns dados para confirmar.
        </p>
      </div>

      {/* Resumo do agendamento estilo "Ticket" */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-foreground truncate">{booking.serviceName}</p>
          <div className="flex items-center gap-2 mt-1">
            <CalendarDays className="w-3.5 h-3.5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              {booking.date && format(new Date(booking.date + 'T12:00:00'), "d 'de' MMM", { locale: ptBR })} às <strong className="text-foreground">{booking.time}</strong>
            </p>
          </div>
        </div>
        <div className="text-right pl-4 border-l border-white/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total</p>
          <p className="text-xl font-bold text-primary leading-none mt-1">R${booking.servicePrice}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold text-foreground">Seu Nome *</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder="Digite seu nome completo"
              className={cn("pl-12 h-14 rounded-2xl text-base", errors.name && "border-destructive focus-visible:ring-destructive/20")}
            />
          </div>
          {errors.name && <p className="text-xs font-medium text-destructive mt-1">{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold text-foreground">WhatsApp *</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
              type="tel"
              placeholder="(00) 90000-0000"
              className={cn("pl-12 h-14 rounded-2xl text-base", errors.phone && "border-destructive focus-visible:ring-destructive/20")}
            />
          </div>
          {errors.phone && <p className="text-xs font-medium text-destructive mt-1">{errors.phone}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold text-foreground">Observações</Label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              placeholder="Alguma preferência de corte ou aviso?"
              rows={3}
              className="pl-12 rounded-2xl text-base py-4 resize-none"
            />
          </div>
        </div>

        <div className="mt-auto pt-6">
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all"
          >
            Confirmar Agendamento
          </Button>
        </div>
      </form>
    </div>
  )
}