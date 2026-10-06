import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { CatalogSection } from '@/features/catalog/components/catalog-section'
import { HomeHero } from '@/features/catalog/components/home-hero'
import { JournalSection } from '@/features/catalog/components/journal-section'
import { MobileCatalogBar } from '@/features/catalog/components/mobile-catalog-bar'
import { PromoCards } from '@/features/catalog/components/promo-cards'
import { catalogListQuery } from '@/features/catalog/queries'
import { catalogSearchSchema, toCatalogQuery, type CatalogSearch } from '@/features/catalog/search'

export const Route = createFileRoute('/')({
  validateSearch: catalogSearchSchema,
  loaderDeps: ({ search }) => toCatalogQuery(search),
  loader: ({ context, deps }) => {
    void context.queryClient.query(catalogListQuery(deps)).catch(() => undefined)
  },
  head: () => ({ meta: [{ title: 'Kurio — Marketplace de NFTs' }] }),
  component: HomePage,
})

function HomePage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/' })

  const handleSearchChange = useCallback(
    (patch: Partial<CatalogSearch>, options?: { keepPage?: boolean }) => {
      void navigate({
        search: (previous) => ({
          ...previous,
          ...patch,
          page: options?.keepPage ? patch.page : undefined,
        }),
        resetScroll: false,
        replace: 'q' in patch,
      })
    },
    [navigate],
  )

  return (
    <div className="flex flex-col gap-8 md:gap-12 lg:gap-24">
      <MobileCatalogBar search={search} onSearchChange={handleSearchChange} />
      <HomeHero />
      <CatalogSection search={search} onSearchChange={handleSearchChange} />
      <PromoCards />
      <JournalSection />
    </div>
  )
}
