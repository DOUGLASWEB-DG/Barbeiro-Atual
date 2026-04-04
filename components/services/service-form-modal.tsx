'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.string().min(1, 'Preço é obrigatório'),
  durationMins: z.string().min(1, 'Duração é obrigatória'),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  service?: any
  onSaved: () => void
}

export function ServiceFormModal({ open, onClose, service, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description ?? '',
        price: String(service.price),
        durationMins: String(service.durationMins),
      })
    } else {
      reset({ name: '', description: '', price: '', durationMins: '30' })
    }
  }, [service, open, reset])

  async function onSubmit(data: FormData) {
    try {
      const url = service ? `/api/services/${service.id}` : '/api/services'
      const method = service ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          durationMins: parseInt(data.durationMins),
        }),
      })

      if (!res.ok) throw new Error('Falha ao salvar')
      toast.success(service ? 'Serviço atualizado' : 'Serviço adicionado')
      onSaved()
    } catch {
      toast.error('Falha ao salvar serviço')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground font-serif">
            {service ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-foreground">Nome do Serviço *</Label>
            <Input {...register('name')} placeholder="Corte Clássico" className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-foreground">Descrição</Label>
            <Textarea {...register('description')} placeholder="Breve descrição do serviço..." rows={2} className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground">Preço (R$) *</Label>
              <Input {...register('price')} type="number" step="0.01" min="0" placeholder="35,00" className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground">Duração (min) *</Label>
              <Input {...register('durationMins')} type="number" min="5" placeholder="30" className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
              {errors.durationMins && <p className="text-xs text-destructive">{errors.durationMins.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              {isSubmitting && <Spinner className="w-3.5 h-3.5" />}
              {service ? 'Atualizar' : 'Adicionar'} Serviço
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
