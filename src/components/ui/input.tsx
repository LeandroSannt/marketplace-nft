import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full min-w-0 border bg-transparent text-body text-foreground transition-colors outline-none placeholder:text-secondary focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error',
  {
    variants: {
      size: {
        default: 'h-10 rounded-sm border-border px-4 py-3',
        auth: 'h-12.5 rounded-xl border-border px-4',
        pill: 'h-12.5 rounded-pill border-border bg-surface-card pl-4 text-caption shadow-card',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

type InputProps = Omit<React.ComponentProps<'input'>, 'size'> & VariantProps<typeof inputVariants>

function Input({ className, size, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
