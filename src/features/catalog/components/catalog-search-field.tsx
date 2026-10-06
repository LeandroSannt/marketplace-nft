import { SearchIcon } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

const DEBOUNCE_MS = 350

interface CatalogSearchFieldProps {
  value: string
  onSearch: (value: string | undefined) => void
}

export function CatalogSearchField({ value, onSearch }: CatalogSearchFieldProps) {
  const inputId = useId()
  const [term, setTerm] = useState(value)
  const [syncedValue, setSyncedValue] = useState(value)

  if (value !== syncedValue) {
    setSyncedValue(value)
    if (value !== term.trim()) setTerm(value)
  }

  useEffect(() => {
    const normalized = term.trim()
    if (normalized === value) return
    const timer = window.setTimeout(() => {
      onSearch(normalized || undefined)
    }, DEBOUNCE_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [term, value, onSearch])

  return (
    <div role="search" className="relative flex-1">
      <label htmlFor={inputId} className="sr-only">
        Buscar NFTs por nome ou criador
      </label>
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-secondary"
        aria-hidden
      />
      <input
        id={inputId}
        type="search"
        value={term}
        onChange={(event) => {
          setTerm(event.target.value)
        }}
        placeholder="Explorar coleções"
        className="h-11.25 w-full rounded-pill border border-border bg-surface-card pr-4 pl-12 text-body text-foreground placeholder:text-secondary focus-visible:border-primary"
      />
    </div>
  )
}
