import { useId } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  catalogSortSchema,
  catalogTabSchema,
  type CatalogSort,
  type CatalogTab,
} from '@/contracts/nft'
import { SORT_LABELS, TAB_LABELS } from '@/lib/labels'
import { cn } from '@/lib/utils'

interface CatalogToolbarProps {
  tab: CatalogTab
  sort: CatalogSort
  onTabChange: (tab: CatalogTab) => void
  onSortChange: (sort: CatalogSort) => void
}

export function CatalogToolbar({ tab, sort, onTabChange, onSortChange }: CatalogToolbarProps) {
  const sortId = useId()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="group"
        aria-label="Listas do catálogo"
        className="flex [scrollbar-width:none] gap-5 overflow-x-auto"
      >
        {catalogTabSchema.options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={tab === option}
            onClick={() => {
              onTabChange(option)
            }}
            className={cn(
              'flex shrink-0 cursor-pointer flex-col gap-1 text-body-md font-medium whitespace-nowrap hover:text-text-accent',
              tab === option ? 'text-text-accent' : 'text-foreground',
            )}
          >
            {TAB_LABELS[option]}
            <span
              aria-hidden
              className={cn('h-0.5 w-full', tab === option ? 'bg-primary' : 'bg-transparent')}
            />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor={sortId} className="text-body-md whitespace-nowrap">
          Ordenar por:
        </label>
        <Select
          value={sort}
          onValueChange={(value) => {
            const parsed = catalogSortSchema.safeParse(value)
            if (parsed.success) onSortChange(parsed.data)
          }}
        >
          <SelectTrigger
            id={sortId}
            className="h-9 w-auto gap-1 border-none bg-transparent px-1 text-body-md shadow-none"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {catalogSortSchema.options.map((option) => (
              <SelectItem key={option} value={option}>
                {SORT_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
