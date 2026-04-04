'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import useSWR from 'swr'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const schema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  serviceId: z.string().min(1, 'Selecione um serviço'),
  date: z.string().min(1, 'Selecione uma data'),
  time: z.string().min(1, 'Selecione um horário'),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED']),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
}

interface Props {
  open: boolean
  onClose: () => void
  appointment?: any
  onSaved: () => void
  defaultDate?: Date
}

export function AppointmentFormModal({ open, onClose, appointment, onSaved, defaultDate }: Props) {
  const { data: clients } = useSWR('/api/clients?minimal=true', fetcher)
  const { data: services } = useSWR('/api/services', fetcher)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'PENDING',
      date: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
    },
  })

  useEffect(() => {
    if (appointment) {
      const apptDate = new Date(appointment.date)
      reset({
        clientId: appointment.clientId,
        serviceId: appointment.serviceId,
        date: format(apptDate, 'yyyy-MM-dd'),
        time: format(apptDate, 'HH:mm'),
        status: appointment.status,
        notes: appointment.notes ?? '',
      })
    } else {
      reset({
        status: 'PENDING',
        date: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        clientId: '',
        serviceId: '',
        notes: '',
      })
    }
  }, [appointment, open, defaultDate, reset])

  async function onSubmit(data: FormData) {
    const datetime = new Date(`${data.date}T${data.time}:00`)

    try {
      const url = appointment ? `/api/appointments/${appointment.id}` : '/api/appointments'
      const method = appointment ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: data.clientId,
          serviceId: data.serviceId,
          date: datetime.toISOString(),
          status: data.status,
          notes: data.notes,
        }),
      })

      if (!res.ok) throw new Error('Falha na requisição')

      toast.success(appointment ? 'Agendamento atualizado' : 'Agendamento criado')
      onSaved()
    } catch {
      toast.error('Falha ao salvar agendamento')
    }
  }

  const selectedService = services?.find((s: any) => s.id === watch('serviceId'))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-white/10 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground font-serif">
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          {/* Cliente */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-foreground">Cliente</Label>
            <Select onValueChange={(v) => setValue('clientId', v)} defaultValue={watch('clientId')}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Selecione o cliente..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {clients?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id} className="text-foreground cursor-pointer">
                    {c.name} — {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && <p className="text-xs text-destructive">{errors.clientId.message}</p>}
          </div>

          {/* Serviço */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-foreground">Serviço</Label>
            <Select onValueChange={(v) => setValue('serviceId', v)} defaultValue={watch('serviceId')}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Selecione o serviço..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {services?.map((s: any) => (
                  <SelectItem key={s.id} value={s.id} className="text-foreground cursor-pointer">
                    {s.name} — R${s.price} ({s.durationMins}min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceId && <p className="text-xs text-destructive">{errors.serviceId.message}</p>}
            {selectedService && (
              <p className="text-xs text-muted-foreground">Duração: {selectedService.durationMins} min</p>
            )}
          </div>

          {/* Data + Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground">Data</Label>
              <Input
                type="date"
                {...register('date')}
                className="bg-input border-border text-foreground"
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground">Horário</Label>
              <Input
                type="time"
                {...register('time')}
                className="bg-input border-border text-foreground"
              />
              {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-foreground">Status</Label>
            <Select onValueChange={(v) => setValue('status', v as any)} defaultValue={watch('status')}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED'] as const).map((s) => (
                  <SelectItem key={s} value={s} className="text-foreground cursor-pointer">
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-foreground">Observações (opcional)</Label>
            <Textarea
              {...register('notes')}
              placeholder="Alguma observação especial..."
              rows={2}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Rodapé */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              {isSubmitting && <Spinner className="w-3.5 h-3.5" />}
              {appointment ? 'Atualizar' : 'Criar'} Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
