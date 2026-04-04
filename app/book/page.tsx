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
  Loader2,
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
        throw new Error(err.error || 'Falha ao agendar')
      }

      const result = await res.json()
      setConfirmedId(result.appointment?.id)
      setStep('success')
      toast.success('Agendamento realizado com sucesso!')
    } catch (err: any) {
      toast.error(err.message || 'Falha ao realizar agendamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Scissors className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold font-serif text-foreground">BARBEIRO ATUAL</span>
        </Link>
        <a
          href={buildWhatsAppLink(booking)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="border-success/40 text-success hover:bg-success/10 gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Agendar via WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </Button>
        </a>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        {/* Indicador de progresso */}
        {step !== 'success' && (
          <div className="flex items-center gap-2 mb-8">
            {(['service', 'datetime', 'details'] as const).map((s, i) => {
              const stepLabels = { service: 'Serviço', datetime: 'Data e Hora', details: 'Dados' }
              const stepIndex = ['service', 'datetime', 'details'].indexOf(step)
              const thisIndex = i
              const done = thisIndex < stepIndex
              const active = thisIndex === stepIndex
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0',
                    done ? 'bg-primary bordeBarberOSr-primary text-primary-foreground' :
                    active ? 'border-primary text-primary' :
                    'border-border text-muted-foreground'
                  )}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    'text-xs font-medium hidden sm:block',
                    active ? 'text-foreground' : done ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {stepLabels[s]}
                  </span>
                  {i < 2 && <div className={cn('flex-1 h-px', done ? 'bg-primary' : 'bg-border')} />}
                </div>
              )
            })}
          </div>
        )}

        {/* PASSO 1 — Seleção de Serviço */}
        {step === 'service' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold font-serif text-foreground text-balance">Escolha um Serviço</h1>
              <p className="text-sm text-muted-foreground mt-1">Selecione o serviço que deseja agendar</p>
            </div>

            {loadingServices ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
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
                      setStep('datetime')
                    }}
                    className={cn(
                      'w-full text-left bg-card border rounded-xl p-4 transition-all hover:border-primary/40 group',
                      booking.serviceId === svc.id ? 'border-primary ring-1 ring-primary/30' : 'border-border'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                          <Scissors className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{svc.name}</p>
                          {svc.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{svc.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-base font-bold text-primary">R${svc.price}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end mt-0.5">
                          <Clock className="w-3 h-3" />
                          {svc.durationMins}min
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {(!services || services.length === 0) && (
                  <div className="text-center py-12 bg-card border border-border rounded-xl">
                    <Scissors className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum serviço disponível no momento</p>
                    <a href={buildWhatsAppLink({})} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
                      <Button variant="outline" size="sm" className="border-success/40 text-success gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Fale conosco no WhatsApp
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Alternativa WhatsApp */}
            <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-4">
              <MessageCircle className="w-8 h-8 text-success shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Prefere WhatsApp?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mande uma mensagem e confirmamos seu horário manualmente
                </p>
              </div>
              <a href={buildWhatsAppLink({})} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90 gap-2 shrink-0">
                  Chat
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* PASSO 2 — Data e Hora */}
        {step === 'datetime' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('service')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold font-serif text-foreground">Escolha Data e Hora</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {booking.serviceName} — R${booking.servicePrice} · {booking.serviceDuration}min
                </p>
              </div>
            </div>

            {/* Grid de Datas */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Selecione a Data</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
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
                        'flex flex-col items-center py-2.5 px-1 rounded-lg border transition-all text-center',
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : isPast
                          ? 'border-border text-muted-foreground/40 cursor-not-allowed'
                          : 'border-border text-foreground hover:border-primary/50 hover:bg-primary/5'
                      )}
                    >
                      <span className="text-xs font-medium">{format(date, 'EEE', { locale: ptBR })}</span>
                      <span className="text-base font-bold leading-tight">{format(date, 'd')}</span>
                      <span className="text-xs">{format(date, 'MMM', { locale: ptBR })}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Horários */}
            {booking.date && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Selecione o Horário — {format(new Date(booking.date + 'T12:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = booking.time === slot
                    return (
                      <button
                        key={slot}
                        onClick={() => setBooking({ ...booking, time: slot })}
                        className={cn(
                          'py-2.5 px-3 rounded-lg border text-sm font-medium transition-all',
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border text-foreground hover:border-primary/50 hover:bg-primary/5'
                        )}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <Button
              onClick={() => setStep('details')}
              disabled={!booking.date || !booking.time}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 gap-2"
            >
              Continuar
              <ArrowRight className="w-4 h-4" />
            </Button>
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
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-success/10 border border-success/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>

            <div>
              <h1 className="text-2xl font-bold font-serif text-foreground text-balance">
                Agendamento Confirmado!
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Seu horário foi agendado com sucesso.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Resumo do Agendamento
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{booking.serviceName}</p>
                  <p className="text-xs text-muted-foreground">R${booking.servicePrice} · {booking.serviceDuration}min</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {booking.date && format(new Date(booking.date + 'T12:00:00'), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">às {booking.time}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={buildWhatsAppLink(booking)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-success text-success-foreground hover:bg-success/90 h-12 gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Confirmar via WhatsApp
                </Button>
              </a>
              <Link href="/">
                <Button variant="outline" className="w-full border-border text-foreground h-12 gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              Entraremos em contato para confirmar seu agendamento em breve.
            </p>
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
    if (!name.trim()) e.name = 'Nome é obrigatório'
    if (!phone.trim()) e.phone = 'Telefone / WhatsApp é obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ name, phone, notes })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Seus Dados</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {booking.serviceName} · {booking.date && format(new Date(booking.date + 'T12:00:00'), "d 'de' MMM", { locale: ptBR })} às {booking.time}
          </p>
        </div>
      </div>

      {/* Resumo do agendamento */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
          <Scissors className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{booking.serviceName}</p>
          <p className="text-xs text-muted-foreground">
            {booking.date && format(new Date(booking.date + 'T12:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })} às {booking.time}
          </p>
        </div>
        <p className="text-base font-bold text-primary shrink-0">R${booking.servicePrice}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-foreground">
            <User className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
            Nome Completo *
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="João Silva"
            className="bg-card border-border text-foreground placeholder:text-muted-foreground h-11"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-foreground">
            <Phone className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
            Telefone / WhatsApp *
          </Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(69) 9 9999-9999"
            className="bg-card border-border text-foreground placeholder:text-muted-foreground h-11"
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          <p className="text-xs text-muted-foreground">
            Usaremos esse número para confirmar seu agendamento via WhatsApp
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-foreground">Observações (opcional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alguma preferência ou pedido especial..."
            rows={3}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 gap-2 mt-2"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
        </Button>
      </form>

      {/* Alternativa WhatsApp */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">Ou agende direto pelo WhatsApp</p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            `Olá! Gostaria de agendar um(a) *${booking.serviceName}* no dia *${booking.date ? format(new Date(booking.date + 'T12:00:00'), "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}* às *${booking.time}*. Meu nome é ${name || '[seu nome]'}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="border-success/40 text-success hover:bg-success/10 gap-2">
            <MessageCircle className="w-4 h-4" />
            Continuar pelo WhatsApp
          </Button>
        </a>
      </div>
    </div>
  )
}
