import { CatalogSection } from '@/features/catalog/components/catalog-section'
import { HomeHero } from '@/features/catalog/components/home-hero'

const noop = () => undefined

export function HomeBackdrop() {
  return (
    <div inert aria-hidden className="flex flex-col gap-24">
      <HomeHero />
      <CatalogSection search={{}} onSearchChange={noop} />
    </div>
  )
}
