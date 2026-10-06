import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { CatalogFilters } from '@/features/catalog/components/catalog-filters'
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination'
import { CatalogResults } from '@/features/catalog/components/catalog-results'
import { CatalogToolbar } from '@/features/catalog/components/catalog-toolbar'
import { FeaturedBanner } from '@/features/catalog/components/featured-banner'
import { catalogListQuery } from '@/features/catalog/queries'
import { hasActiveFilters, toCatalogQuery, type CatalogSearch } from '@/features/catalog/search'

interface CatalogSectionProps {
  search: CatalogSearch
  onSearchChange: (patch: Partial<CatalogSearch>, options?: { keepPage?: boolean }) => void
}

const CLEARED_FILTERS: Partial<CatalogSearch> = {
  q: undefined,
  collections: undefined,
  networks: undefined,
  minPrice: undefined,
  maxPrice: undefined,
}

export function CatalogSection({ search, onSearchChange }: CatalogSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const catalogQuery = toCatalogQuery(search)
  const query = useQuery(catalogListQuery(catalogQuery))
  const facets = query.data?.facets
  const activeFilters = hasActiveFilters(search)

  return (
    <section
      ref={sectionRef}
      id="catalogo"
      aria-labelledby="catalog-title"
      className="flex scroll-mt-6 gap-12"
    >
      <h2 id="catalog-title" className="sr-only">
        Catálogo de NFTs
      </h2>
      <aside aria-label="Filtros" className="hidden w-77.5 shrink-0 flex-col gap-6 lg:flex">
        <CatalogFilters search={search} facets={facets} onChange={onSearchChange} />
        <FeaturedBanner />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-8">
        {search.q && (
          <p className="text-body text-text-secondary">
            Resultados para <strong className="text-foreground">“{search.q}”</strong>
          </p>
        )}

        <CatalogToolbar
          tab={catalogQuery.tab ?? 'all'}
          sort={catalogQuery.sort ?? 'recent'}
          onTabChange={(tab) => {
            onSearchChange({ tab: tab === 'all' ? undefined : tab })
          }}
          onSortChange={(sort) => {
            onSearchChange({ sort: sort === 'recent' ? undefined : sort })
          }}
        />

        <p aria-live="polite" className="sr-only">
          {query.data ? `${query.data.total} NFTs encontrados, página ${query.data.page}` : ''}
        </p>

        <CatalogResults
          query={query}
          canClearFilters={activeFilters}
          onClearFilters={() => {
            onSearchChange(CLEARED_FILTERS)
          }}
        />

        {query.data && (
          <CatalogPagination
            page={query.data.page}
            totalPages={query.data.totalPages}
            onChange={(page) => {
              onSearchChange({ page: page === 1 ? undefined : page }, { keepPage: true })
              sectionRef.current?.scrollIntoView({ block: 'start' })
            }}
          />
        )}
      </div>
    </section>
  )
}
