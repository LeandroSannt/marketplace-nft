import { TicketPercentIcon, XIcon } from 'lucide-react'
import { useId, useState, type SyntheticEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { applyCouponRequestSchema } from '@/contracts/cart'
import { useApplyCoupon, useRemoveCoupon, type CartScope } from '@/features/cart/queries'
import { toApiError } from '@/lib/api-error'

interface CouponFormProps {
  scope: CartScope
  appliedCode: string | null
}

export function CouponForm({ scope, appliedCode }: CouponFormProps) {
  const inputId = useId()
  const errorId = useId()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const apply = useApplyCoupon(scope)
  const remove = useRemoveCoupon(scope)

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = applyCouponRequestSchema.safeParse({ code })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Código inválido')
      return
    }
    setError(null)
    apply.mutate(parsed.data.code, {
      onSuccess: () => {
        setCode('')
        toast.success(`Cupom ${parsed.data.code} aplicado.`)
      },
      onError: (mutationError) => {
        setError(toApiError(mutationError).message)
      },
    })
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-pill border border-primary bg-surface-card px-4 py-3">
        <span className="flex items-center gap-2 text-body">
          <TicketPercentIcon className="size-5 text-text-accent" aria-hidden />
          Cupom <strong className="text-text-accent">{appliedCode}</strong> aplicado
        </span>
        <button
          type="button"
          disabled={remove.isPending}
          onClick={() => {
            remove.mutate(undefined, {
              onSuccess: () => toast.success('Cupom removido.'),
              onError: (mutationError) => toast.error(toApiError(mutationError).message),
            })
          }}
          aria-label={`Remover cupom ${appliedCode}`}
          className="grid size-8 cursor-pointer place-items-center text-text-secondary hover:text-text-coral"
        >
          <XIcon className="size-4" aria-hidden />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
      <label htmlFor={inputId} className="sr-only">
        Código promocional
      </label>
      <div className="flex h-12.5 items-center overflow-hidden rounded-pill border border-border bg-surface-card pl-4 shadow-card focus-within:border-primary has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-primary has-[input[aria-invalid=true]]:border-error">
        <input
          id={inputId}
          value={code}
          onChange={(event) => {
            setCode(event.target.value)
            setError(null)
          }}
          placeholder="Código do cupom"
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 bg-transparent text-caption text-ellipsis text-foreground uppercase placeholder:text-secondary placeholder:normal-case focus-visible:outline-none"
        />
        <Button
          type="submit"
          disabled={apply.isPending}
          aria-busy={apply.isPending}
          className="mr-1 h-10.5 shrink-0 rounded-pill px-4 text-body"
        >
          {apply.isPending ? 'Aplicando…' : 'Aplicar'}
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="pl-4 text-caption-sm text-error-foreground">
          {error}
        </p>
      )}
    </form>
  )
}
