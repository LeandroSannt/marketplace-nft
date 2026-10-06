import { useId } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SelectFieldProps<T extends string> {
  label: string
  value: T | undefined
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
  placeholder?: string
  error?: string
  required?: boolean
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder,
  error,
  required,
}: SelectFieldProps<T>) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={id} className="text-body-md">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-text-coral">
            *
          </span>
        )}
      </label>
      <Select
        value={value}
        onValueChange={(next) => {
          const option = options.find((item) => item.value === next)
          if (option) onChange(option.value)
        }}
      >
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          className="h-10 w-full rounded-sm border-border px-4 text-body aria-invalid:border-error"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={errorId} className="text-caption-sm text-error-foreground">
          {error}
        </p>
      )}
    </div>
  )
}
