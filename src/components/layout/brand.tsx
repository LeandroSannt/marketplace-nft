import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Kurio, página inicial"
      className={cn('text-body font-bold tracking-[0.1em] text-foreground uppercase', className)}
    >
      Kurio
    </Link>
  )
}
