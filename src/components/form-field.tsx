import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useId, useState, type ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type InputSize = 'default' | 'auth'

interface FieldProps extends Omit<ComponentProps<'input'>, 'size'> {
  label: string
  error?: string
  hideLabel?: boolean
  size?: InputSize
  required?: boolean
}

function FieldShell({
  id,
  label,
  error,
  hideLabel,
  required,
  children,
}: {
  id: string
  label: string
  error?: string
  hideLabel?: boolean
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={id} className={cn('text-body-md', hideLabel && 'sr-only')}>
        {label}
        {required && !hideLabel && (
          <span aria-hidden className="ml-1 text-text-coral">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-caption-sm text-error-foreground">
          {error}
        </p>
      )}
    </div>
  )
}

export function TextField({ label, error, hideLabel, size, required, id, ...props }: FieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <FieldShell id={inputId} label={label} error={error} hideLabel={hideLabel} required={required}>
      <Input
        id={inputId}
        size={size}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-required={required}
        {...props}
      />
    </FieldShell>
  )
}

interface TextareaFieldProps extends ComponentProps<'textarea'> {
  label: string
  error?: string
  required?: boolean
}

export function TextareaField({ label, error, required, id, ...props }: TextareaFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <FieldShell id={inputId} label={label} error={error} required={required}>
      <Textarea
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-required={required}
        {...props}
      />
    </FieldShell>
  )
}

export function PasswordField({
  label,
  error,
  hideLabel,
  size,
  required,
  id,
  ...props
}: FieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [visible, setVisible] = useState(false)
  return (
    <FieldShell id={inputId} label={label} error={error} hideLabel={hideLabel} required={required}>
      <div className="relative">
        <Input
          id={inputId}
          size={size}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-required={required}
          className="pr-12"
          {...props}
        />
        <button
          type="button"
          onClick={() => {
            setVisible((current) => !current)
          }}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 cursor-pointer place-items-center text-border-soft hover:text-text-accent"
        >
          {visible ? (
            <EyeIcon className="size-4.5" aria-hidden />
          ) : (
            <EyeOffIcon className="size-4.5" aria-hidden />
          )}
        </button>
      </div>
    </FieldShell>
  )
}
