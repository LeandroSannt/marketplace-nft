import { CheckIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import type { Network } from '@/contracts/common'
import type { CatalogResponse, Collection } from '@/contracts/nft'
import { COLLECTION_LABELS, NETWORK_LABELS } from '@/lib/labels'
import { formatEthDecimal, fromEthSteps, toEthSteps } from '@/lib/money'
import { hasActiveFilters, type CatalogSearch } from '@/features/catalog/search'
import { cn } from '@/lib/utils'

export type CatalogFacets = CatalogResponse['facets']

interface CatalogFiltersProps {
  search: CatalogSearch
  facets: CatalogFacets | undefined
  onChange: (patch: Partial<CatalogSearch>) => void
}

function toggle<T>(list: T[] | undefined, value: T) {
  const current = list ?? []
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]
  return next.length ? next : undefined
}

function FacetOption({
  label,
  count,
  selected,
  onToggle,
}: {
  label: string
  count: number
  selected: boolean
  onToggle: () => void
}) {
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        onClick={onToggle}
        className={cn(
          'flex h-10 w-full cursor-pointer items-center justify-between gap-2 text-left text-body-md leading-10 hover:text-text-accent',
          selected ? 'font-bold text-text-accent' : 'text-text-secondary',
        )}
      >
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden
            className={cn(
              'grid size-4 place-items-center rounded-xs border',
              selected ? 'border-primary bg-primary text-ink' : 'border-border-soft',
            )}
          >
            {selected && <CheckIcon className="size-3" strokeWidth={3} />}
          </span>
          {label}
        </span>
        <span className="font-bold">({count})</span>
      </button>
    </li>
  )
}

function FacetListSkeleton({ rows }: { rows: number }) {
  return (
    <div aria-hidden className="flex flex-col">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex h-10 items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  )
}

function PriceFilter({ search, facets, onChange }: CatalogFiltersProps) {
  const minPrice = facets?.priceRange.min ?? '0'
  const maxPrice = facets?.priceRange.max ?? '0'
  const min = toEthSteps(minPrice)
  const max = toEthSteps(maxPrice)
  const selected: [number, number] = [
    toEthSteps(search.minPrice ?? minPrice),
    toEthSteps(search.maxPrice ?? maxPrice),
  ]
  const [range, setRange] = useState(selected)

  const format = (steps: number) => formatEthDecimal(fromEthSteps(steps))

  return (
    <section aria-labelledby="price-filter-title" className="flex flex-col gap-3">
      <h3 id="price-filter-title" className="text-body-xl leading-4 font-bold">
        Faixa de preço
      </h3>
      <div className="flex flex-col gap-3 pl-3">
        <Slider
          min={min}
          max={max}
          step={1}
          value={range}
          disabled={!facets || max <= min}
          minStepsBetweenThumbs={1}
          onValueChange={(value) => {
            setRange([value[0] ?? min, value[1] ?? max])
          }}
          aria-label="Faixa de preço em ETH"
          thumbLabels={['Preço mínimo', 'Preço máximo']}
        />
        {facets ? (
          <p className="text-body-md" aria-live="polite">
            Preço: {format(range[0])} - {format(range[1])} ETH
          </p>
        ) : (
          <Skeleton className="h-5 w-52" />
        )}
        <Button
          size="sm"
          className="w-fit"
          disabled={!facets}
          onClick={() => {
            onChange({
              minPrice: range[0] > min ? fromEthSteps(range[0]) : undefined,
              maxPrice: range[1] < max ? fromEthSteps(range[1]) : undefined,
            })
          }}
        >
          Aplicar
        </Button>
      </div>
    </section>
  )
}

export function CatalogFilters(props: CatalogFiltersProps) {
  const { search, facets, onChange } = props

  return (
    <div className="flex flex-col gap-10 bg-surface-card p-5">
      <section aria-labelledby="collections-filter-title" className="flex flex-col gap-3">
        <h3 id="collections-filter-title" className="text-body-xl leading-4 font-bold">
          Coleções
        </h3>
        {!facets && <FacetListSkeleton rows={9} />}
        <ul className="px-3">
          {(facets?.collections ?? []).map((facet) => (
            <FacetOption
              key={facet.id}
              label={COLLECTION_LABELS[facet.id]}
              count={facet.count}
              selected={search.collections?.includes(facet.id) ?? false}
              onToggle={() => {
                onChange({ collections: toggle<Collection>(search.collections, facet.id) })
              }}
            />
          ))}
        </ul>
      </section>

      <PriceFilter
        key={`${search.minPrice ?? ''}-${search.maxPrice ?? ''}-${facets?.priceRange.min ?? ''}-${facets?.priceRange.max ?? ''}`}
        {...props}
      />

      <section aria-labelledby="network-filter-title" className="flex flex-col gap-3">
        <h3 id="network-filter-title" className="text-body-xl leading-4 font-bold">
          Rede
        </h3>
        {!facets && <FacetListSkeleton rows={3} />}
        <ul className="pl-3">
          {(facets?.networks ?? []).map((facet) => (
            <FacetOption
              key={facet.id}
              label={NETWORK_LABELS[facet.id]}
              count={facet.count}
              selected={search.networks?.includes(facet.id) ?? false}
              onToggle={() => {
                onChange({ networks: toggle<Network>(search.networks, facet.id) })
              }}
            />
          ))}
        </ul>
      </section>

      {hasActiveFilters(search) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onChange({
              q: undefined,
              collections: undefined,
              networks: undefined,
              minPrice: undefined,
              maxPrice: undefined,
            })
          }}
        >
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
