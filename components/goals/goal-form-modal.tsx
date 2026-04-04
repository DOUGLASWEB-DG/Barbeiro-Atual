'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

const schema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  type: z.enum(['REVENUE', 'CLIENTS', 'APPOINTMENTS']),
  targetAmount: z.string().min(1, 'Meta é obrigatória'),
  period: z.enum(['daily', 'weekly', 'monthly']),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function GoalFormModal({ open, onClose, onSaved }: Props) {
  const now = new Date()
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
      type: 'REVENUE',
      period: 'monthly',
      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
    },
  })

  const period = watch('period')

  useEffect(() => {
    if (open) {
      const n = new Date()
      reset({
        title: '',
        type: 'REVENUE',
        period: 'monthly',
        targetAmount: '',
        startDate: format(startOfMonth(n), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(n), 'yyyy-MM-dd'),
      })
    }
  }, [open, reset])

  // Auto-definir datas baseado no período
  useEffect(() => {
    const n = new Date()
    if (period === 'monthly') {
      setValue('startDate', format(startOfMonth(n), 'yyyy-MM-dd'))
      setValue('endDate', format(endOfMonth(n), 'yyyy-MM-dd'))
    } else if (period === 'daily') {
      setValue('startDate', format(n, 'yyyy-MM-dd'))
      setValue('endDate', format(n, 'yyyy-MM-dd'))
    } else if (period === 'weekly') {
      const start = new Date(n)
      start.setDate(n.getDate() - n.getDay() + 1)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      setValue('startDate', format(start, 'yyyy-MM-dd'))
      setValue('endDate', format(end, 'yyyy-MM-dd'))
    }
  }, [period, setValue])

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          targetAmount: parseFloat(data.targetAmount),
        }),
      })

      if (!res.ok) throw new Error('Falha ao salvar')
      toast.success('Meta criada!')
      onSaved()
    } catch {
      toast.error('Falha ao criar meta')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground font-serif">Criar Nova Meta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-foreground">Título da Meta *</Label>
            <Input
              {...register('title')}
              placeholder="Meta de Receita Mensal"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground">Tipo de Meta *</Label>
              <Select onValueChange={(v: string) => setValue('type', v as any)} defaultValue="REVENUE">
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="REVENUE" className="text-foreground cursor-pointer">Receita (R$)</SelectItem>
                  <SelectItem value="CLIENTS" className="text-foreground cursor-pointer">Novos Clientes</SelectItem>
                  <SelectItem value="APPOINTMENTS" className="text-foreground cursor-pointer">Agendamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground">Período *</Label>
              <Select onValueChange={(v: string) => setValue('period', v as any)} defaultValue="monthly">
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="daily" className="text-foreground cursor-pointer">Diário</SelectItem>
                  <SelectItem value="weekly" className="text-foreground cursor-pointer">Semanal</SelectItem>
                  <SelectItem value="monthly" className="text-foreground cursor-pointer">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-foreground">Valor da Meta *</Label>
            <Input
              {...register('targetAmount')}
              type="number"
              step="1"
              min="1"
              placeholder="Ex: 3000"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            {errors.targetAmount && <p className="text-xs text-destructive">{errors.targetAmount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground">Data Início</Label>
              <Input
                type="date"
                {...register('startDate')}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground">Data Fim</Label>
              <Input
                type="date"
                {...register('endDate')}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              {isSubmitting && <Spinner className="w-3.5 h-3.5" />}
              Criar Meta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
