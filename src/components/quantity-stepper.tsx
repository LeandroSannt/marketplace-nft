import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  max: number
  label: string
  onChange: (value: number) => void
  disabled?: boolean
  size?: 'md' | 'lg'
  className?: string
}

const touchTarget = 'relative after:absolute after:-inset-2 after:content-[""]'

export function QuantityStepper({
  value,
  max,
  label,
  onChange,
  disabled = false,
  size = 'md',
  className,
}: QuantityStepperProps) {
  const buttonSize = size === 'lg' ? 'quantity-lg' : 'quantity'
  const iconClass = size === 'lg' ? 'size-4' : 'size-3.5'

  return (
    <div
      role="group"
      aria-label={`Quantidade de ${label}`}
      className={cn('flex items-center gap-3', className)}
    >
      <Button
        type="button"
        variant="quantity"
        size={buttonSize}
        className={touchTarget}
        aria-label="Diminuir quantidade"
        disabled={disabled || value <= 1}
        onClick={() => {
          onChange(value - 1)
        }}
      >
        <MinusIcon className={iconClass} strokeWidth={3} aria-hidden />
      </Button>
      <output
        aria-live="polite"
        className={cn('min-w-6 text-center', size === 'lg' ? 'text-title' : 'text-body-lg')}
      >
        {value}
      </output>
      <Button
        type="button"
        variant="quantity"
        size={buttonSize}
        className={touchTarget}
        aria-label="Aumentar quantidade"
        disabled={disabled || value >= max}
        onClick={() => {
          onChange(value + 1)
        }}
      >
        <PlusIcon className={iconClass} strokeWidth={3} aria-hidden />
      </Button>
    </div>
  )
}
