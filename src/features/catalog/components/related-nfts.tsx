import { useQuery } from '@tanstack/react-query'
import type { Collection } from '@/contracts/nft'
import { NftCard, NftCardSkeleton } from '@/features/catalog/components/nft-card'
import { catalogListQuery } from '@/features/catalog/queries'

const RELATED_COUNT = 5

interface RelatedNftsProps {
  title: string
  collection?: Collection
  excludeIds?: string[]
}

export function RelatedNfts({ title, collection, excludeIds = [] }: RelatedNftsProps) {
  const { data, isPending, isError } = useQuery(
    catalogListQuery({
      collections: collection ? [collection] : undefined,
      page: 1,
    }),
  )

  if (isError) return null

  const items = (data?.items ?? [])
    .filter((nft) => !excludeIds.includes(nft.id))
    .slice(0, RELATED_COUNT)
  if (!isPending && items.length === 0) return null

  return (
    <section aria-labelledby="related-title" className="flex flex-col gap-8">
      <h2
        id="related-title"
        className="border-b border-primary/40 pb-3 text-section font-bold text-text-accent"
      >
        {title}
      </h2>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
        {isPending
          ? Array.from({ length: RELATED_COUNT }, (_, index) => (
              <li key={index}>
                <NftCardSkeleton />
              </li>
            ))
          : items.map((nft) => (
              <li key={nft.id}>
                <NftCard nft={nft} />
              </li>
            ))}
      </ul>
    </section>
  )
}
