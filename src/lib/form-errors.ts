import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { toApiError } from '@/lib/api-error'

export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string | null {
  const apiError = toApiError(error)
  let mapped = false
  for (const field of fields) {
    const message = apiError.fields[field]?.[0]
    if (message) {
      setError(field, { type: 'server', message }, { shouldFocus: !mapped })
      mapped = true
    }
  }
  return mapped ? null : apiError.message
}
