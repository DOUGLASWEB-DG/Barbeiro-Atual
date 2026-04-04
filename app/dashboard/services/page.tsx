'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Scissors, Clock, DollarSign, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { confirmAction } from '@/lib/confirm-toast'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ServiceFormModal } from '@/components/services/service-form-modal'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ServicesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const { data: services, mutate } = useSWR('/api/services', fetcher)

  async function deleteService(id: string, name: string) {
    const ok = await confirmAction({
      title: `Excluir serviço "${name}"?`,
      confirmLabel: 'Excluir',
    })
    if (!ok) return
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' })
      mutate()
      toast.success('Serviço excluído')
    } catch {
      toast.error('Falha ao excluir serviço')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif text-foreground">Serviços</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie seu catálogo de serviços</p>
        </div>
        <Button
          onClick={() => { setEditingService(null); setModalOpen(true) }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </Button>
      </div>

      {services && services.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc: any) => (
            <div
              key={svc.id}
              className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                  <Scissors className="w-5 h-5 text-primary" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem onClick={() => { setEditingService(svc); setModalOpen(true) }} className="gap-2 cursor-pointer">
                      <Pencil className="w-4 h-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteService(svc.id, svc.name)} className="gap-2 cursor-pointer text-destructive">
                      <Trash2 className="w-4 h-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{svc.name}</p>
                {svc.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{svc.description}</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{svc.durationMins} min</span>
                </div>
                <div className="flex items-center gap-1 text-primary font-bold">
                  <span className="text-sm">R${svc.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground mb-1">Nenhum serviço ainda</p>
          <p className="text-sm text-muted-foreground">Adicione os serviços que você oferece</p>
          <Button
            onClick={() => setModalOpen(true)}
            className="mt-4 bg-primary text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar Serviço
          </Button>
        </div>
      )}

      <ServiceFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingService(null) }}
        service={editingService}
        onSaved={() => { mutate(); setModalOpen(false); setEditingService(null) }}
      />
    </div>
  )
}
