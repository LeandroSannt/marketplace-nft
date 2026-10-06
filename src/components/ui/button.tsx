import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-[filter,background-color,color] hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        primary: 'bg-primary text-body-lg font-bold text-primary-foreground',
        cta: 'bg-gradient-cta text-body-lg font-bold text-primary-foreground',
        outline:
          'border border-border bg-transparent text-caption font-medium text-text-secondary hover:bg-surface-raised',
        ghost: 'text-body font-bold text-text-accent hover:brightness-125',
        quantity:
          'border border-ink bg-primary text-title font-normal text-primary-foreground shadow-control',
      },
      size: {
        default: 'h-10 rounded-md px-7',
        sm: 'h-9 rounded-md px-3 py-2',
        form: 'h-10 min-w-32.75 rounded-xs px-6',
        modal: 'h-11.25 w-full rounded-sm',
        auth: 'h-15 w-full rounded-xl',
        pill: 'h-15 w-full rounded-pill',
        social: 'h-10 w-full rounded-sm',
        inline: 'h-auto p-0',
        quantity: 'h-7.5 w-5 rounded-[20px]',
        'quantity-lg': 'h-[49.5px] w-8.25 rounded-[33px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
