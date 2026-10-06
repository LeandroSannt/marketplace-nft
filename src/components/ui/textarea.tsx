import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'field-sizing-content min-h-20 w-full rounded-sm border border-border bg-transparent px-4 py-3 text-body text-foreground placeholder:text-secondary focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
