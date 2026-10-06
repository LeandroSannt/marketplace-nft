import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CatalogPaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const MAX_VISIBLE = 4

function visiblePages(page: number, totalPages: number) {
  const start = Math.max(1, Math.min(page - 1, totalPages - MAX_VISIBLE + 1))
  return Array.from({ length: Math.min(MAX_VISIBLE, totalPages) }, (_, index) => start + index)
}

const itemClass =
  'grid size-8.75 cursor-pointer place-items-center rounded-[4px] border border-border text-body-lg text-foreground hover:border-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border'

export function CatalogPagination({ page, totalPages, onChange }: CatalogPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginação do catálogo" className="flex justify-end">
      <ul className="flex gap-2">
        <li>
          <button
            type="button"
            className={itemClass}
            disabled={page === 1}
            onClick={() => {
              onChange(page - 1)
            }}
            aria-label="Página anterior"
          >
            <ChevronLeftIcon className="size-5" aria-hidden />
          </button>
        </li>
        {visiblePages(page, totalPages).map((item) => (
          <li key={item}>
            <button
              type="button"
              className={cn(
                itemClass,
                item === page &&
                  'border-primary bg-primary font-bold text-ink hover:border-primary',
              )}
              aria-current={item === page ? 'page' : undefined}
              aria-label={`Página ${item}`}
              onClick={() => {
                onChange(item)
              }}
            >
              {item}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={itemClass}
            disabled={page === totalPages}
            onClick={() => {
              onChange(page + 1)
            }}
            aria-label="Próxima página"
          >
            <ChevronRightIcon className="size-5" aria-hidden />
          </button>
        </li>
      </ul>
    </nav>
  )
}
