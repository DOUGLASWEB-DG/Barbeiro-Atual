'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  Search,
  Users,
  MessageCircle,
  Pencil,
  Trash2,
  MoreVertical,
  Phone,
  Mail,
  CalendarDays,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { confirmAction } from '@/lib/confirm-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ClientFormModal } from '@/components/clients/client-form-modal'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)

  const url = `/api/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`
  const { data: clients, mutate } = useSWR(url, fetcher)

  async function deleteClient(id: string, name: string) {
    const ok = await confirmAction({
      title: `Excluir cliente "${name}"?`,
      description: 'Isso também removerá os agendamentos vinculados.',
      confirmLabel: 'Excluir',
    })
    if (!ok) return
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      mutate()
      toast.success('Cliente excluído')
    } catch {
      toast.error('Falha ao excluir cliente')
    }
  }

  function openWhatsApp(client: any) {
    const phone = client.phone.replace(/\D/g, '')
    const msg = encodeURIComponent(`Olá ${client.name}! Temos horários disponíveis. Gostaria de agendar um horário?`)
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold tracking-tight text-foreground">Clientes</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {clients?.length ?? 0} clientes cadastrados
          </p>
        </div>
        <Button
          onClick={() => { setEditingClient(null); setModalOpen(true) }}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-white/10 bg-zinc-900/80 pl-10 text-foreground placeholder:text-muted-foreground backdrop-blur-sm"
        />
      </div>

      {/* Grid de Clientes */}
      {clients && clients.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: any) => {
            const lastAppt = client.appointments?.[0]
            return (
              <div
                key={client.id}
                className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-5 backdrop-blur-sm transition-all duration-150 hover:border-primary/25 active:scale-[0.99] active:bg-zinc-800/80"
              >
                {/* Avatar + Nome */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {client._count?.appointments ?? 0} visitas
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem onClick={() => { setEditingClient(client); setModalOpen(true) }} className="gap-2 cursor-pointer">
                        <Pencil className="w-4 h-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openWhatsApp(client)} className="gap-2 cursor-pointer text-success">
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => deleteClient(client.id, client.name)} className="gap-2 cursor-pointer text-destructive">
                        <Trash2 className="w-4 h-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Info de Contato */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>

                {/* Último agendamento */}
                {lastAppt && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0 text-primary" />
                    <span>
                      Último: {lastAppt.service?.name} — {format(new Date(lastAppt.date), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}

                {/* Observações */}
                {client.notes && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                    <span className="italic leading-relaxed">{client.notes}</span>
                  </div>
                )}

                {/* Botão WhatsApp */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openWhatsApp(client)}
                  className="w-full gap-2 border-border text-foreground hover:border-success hover:text-success text-xs mt-auto"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Enviar WhatsApp
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground mb-1">
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
          </p>
          <p className="text-sm text-muted-foreground">
            {search ? 'Tente um termo de busca diferente' : 'Adicione seu primeiro cliente para começar'}
          </p>
          {!search && (
            <Button
              onClick={() => { setEditingClient(null); setModalOpen(true) }}
              className="mt-4 bg-primary text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar Cliente
            </Button>
          )}
        </div>
      )}

      <ClientFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingClient(null) }}
        client={editingClient}
        onSaved={() => { mutate(); setModalOpen(false); setEditingClient(null) }}
      />
    </div>
  )
}
