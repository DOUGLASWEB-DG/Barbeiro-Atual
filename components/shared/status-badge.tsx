import { cn } from '@/lib/utils'

type Status = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; classes: string }> = {
  PENDING: {
    label: 'Pendente',
    classes: 'bg-warning/10 text-warning border border-warning/20',
  },
  CONFIRMED: {
    label: 'Confirmado',
    classes: 'bg-info/10 text-info border border-info/20',
  },
  COMPLETED: {
    label: 'Concluído',
    classes: 'bg-success/10 text-success border border-success/20',
  },
  CANCELED: {
    label: 'Cancelado',
    classes: 'bg-destructive/10 text-destructive border border-destructive/20',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.classes, className)}>
      {config.label}
    </span>
  )
}
