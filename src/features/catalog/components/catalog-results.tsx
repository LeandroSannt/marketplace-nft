import type { UseQueryResult } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { CATALOG_PAGE_SIZE, type CatalogResponse } from '@/contracts/nft'
import { NftCard, NftCardSkeleton } from '@/features/catalog/components/nft-card'
import { useFavoriteIds } from '@/features/favorites/hooks'
import { toApiError } from '@/lib/api-error'
import { cn } from '@/lib/utils'

interface CatalogResultsProps {
  query: UseQueryResult<CatalogResponse>
  canClearFilters: boolean
  onClearFilters: () => void
}

const gridClass =
  'grid grid-cols-2 gap-x-4 gap-y-10 max-md:pb-8 md:grid-cols-3 md:gap-x-8 lg:gap-y-18'

export function CatalogResults({ query, canClearFilters, onClearFilters }: CatalogResultsProps) {
  const favoriteIds = useFavoriteIds()
  const { data, isPending, isError, error, isPlaceholderData, isFetching, refetch } = query

  if (isPending) {
    return (
      <div role="status" aria-label="Carregando NFTs" className={gridClass}>
        {Array.from({ length: CATALOG_PAGE_SIZE }, (_, index) => (
          <NftCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-lg bg-surface-card px-6 py-16 text-center"
      >
        <p className="text-body-xl font-bold">Não foi possível carregar o catálogo</p>
        <p className="text-body text-text-secondary">{toApiError(error).message}</p>
        <Button
          onClick={() => {
            void refetch()
          }}
          disabled={isFetching}
          aria-busy={isFetching}
        >
          {isFetching ? 'Tentando novamente…' : 'Tentar novamente'}
        </Button>
      </div>
    )
  }

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg bg-surface-card px-6 py-16 text-center">
        <p className="text-body-xl font-bold">Nenhum NFT encontrado</p>
        <p className="text-body text-text-secondary">
          Tente outros termos de busca ou ajuste os filtros selecionados.
        </p>
        {canClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>
    )
  }

  return (
    <ul
      aria-busy={isPlaceholderData}
      className={cn(gridClass, isPlaceholderData && 'opacity-60 transition-opacity')}
    >
      {data.items.map((nft, index) => (
        <li key={nft.id} className="max-md:even:translate-y-8">
          <NftCard
            nft={nft}
            isFavorite={favoriteIds.includes(nft.id)}
            priority={index < 3 && data.page === 1}
          />
        </li>
      ))}
    </ul>
  )
}
