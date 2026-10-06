import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontalIcon } from 'lucide-react'
import { useCallback } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CatalogFilters } from '@/features/catalog/components/catalog-filters'
import { CatalogSearchField } from '@/features/catalog/components/catalog-search-field'
import { catalogListQuery } from '@/features/catalog/queries'
import { hasActiveFilters, toCatalogQuery, type CatalogSearch } from '@/features/catalog/search'

interface MobileCatalogBarProps {
  search: CatalogSearch
  onSearchChange: (patch: Partial<CatalogSearch>) => void
}

export function MobileCatalogBar({ search, onSearchChange }: MobileCatalogBarProps) {
  const { data } = useQuery(catalogListQuery(toCatalogQuery(search)))
  const activeFilters = hasActiveFilters(search)
  const handleSearch = useCallback(
    (q: string | undefined) => {
      onSearchChange({ q })
    },
    [onSearchChange],
  )

  return (
    <div className="flex items-center gap-3 lg:hidden">
      <CatalogSearchField value={search.q ?? ''} onSearch={handleSearch} />
      <Sheet>
        <SheetTrigger
          aria-label={activeFilters ? 'Filtros (ativos)' : 'Filtros'}
          className="relative grid size-[45px] shrink-0 cursor-pointer place-items-center rounded-pill border border-border bg-surface-card text-foreground"
        >
          <SlidersHorizontalIcon className="size-5" aria-hidden />
          {activeFilters && (
            <span aria-hidden className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
          )}
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-85 max-w-full overflow-y-auto border-border bg-ink p-0"
        >
          <SheetHeader className="px-5 pt-5">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <CatalogFilters search={search} facets={data?.facets} onChange={onSearchChange} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
