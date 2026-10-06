import { useNavigate } from '@tanstack/react-router'
import { SearchIcon, XIcon } from 'lucide-react'
import { useId, useRef, useState, type SyntheticEvent } from 'react'

export function HeaderSearch() {
  const navigate = useNavigate()
  const inputId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [term, setTerm] = useState('')
  const shouldRestoreFocus = useRef(false)

  function close() {
    shouldRestoreFocus.current = true
    setIsOpen(false)
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = term.trim()
    void navigate({ to: '/', search: q ? { q } : {}, hash: 'catalogo' })
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        aria-label="Buscar NFTs"
        aria-expanded={false}
        ref={(button) => {
          if (!button || !shouldRestoreFocus.current) return
          shouldRestoreFocus.current = false
          button.focus()
        }}
        onClick={() => {
          setIsOpen(true)
        }}
        className="grid size-11 cursor-pointer place-items-center text-foreground hover:text-text-accent"
      >
        <SearchIcon className="size-5" aria-hidden />
      </button>
    )
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="flex items-center gap-2">
      <label htmlFor={inputId} className="sr-only">
        Buscar NFTs por nome ou criador
      </label>
      <input
        id={inputId}
        autoFocus
        type="search"
        value={term}
        onChange={(event) => {
          setTerm(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close()
        }}
        placeholder="Buscar NFTs"
        className="h-9 w-40 rounded-sm border border-border bg-transparent px-3 text-body text-foreground placeholder:text-secondary focus-visible:border-primary xl:w-56"
      />
      <button
        type="button"
        aria-label="Fechar busca"
        onClick={close}
        className="grid size-9 cursor-pointer place-items-center text-foreground hover:text-text-accent"
      >
        <XIcon className="size-5" aria-hidden />
      </button>
    </form>
  )
}
