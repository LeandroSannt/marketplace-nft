import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { NftDetailView } from '@/features/catalog/components/nft-detail-view'
import { RelatedNfts } from '@/features/catalog/components/related-nfts'
import { nftDetailQuery } from '@/features/catalog/queries'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { toApiError } from '@/lib/api-error'

export const Route = createFileRoute('/nfts/$nftId')({
  loader: ({ context, params }) => {
    void context.queryClient.query(nftDetailQuery(params.nftId)).catch(() => undefined)
  },
  head: () => ({ meta: [{ title: 'Detalhes do NFT — Kurio' }] }),
  component: NftDetailPage,
})

function DetailSkeleton() {
  return (
    <div role="status" aria-label="Carregando NFT" className="flex flex-col gap-8 lg:flex-row">
      <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-7">
        <div className="flex gap-4 md:flex-col">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="size-18 md:size-25" />
          ))}
        </div>
        <Skeleton className="aspect-square w-full rounded-md md:size-111" />
      </div>
      <div className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

function NftDetailPage() {
  const { nftId } = Route.useParams()
  const { data, isPending, isError, error, refetch, isFetching } = useQuery(nftDetailQuery(nftId))

  if (isPending) return <DetailSkeleton />

  if (isError) {
    const apiError = toApiError(error)
    if (apiError.code === 'NOT_FOUND') {
      return (
        <div className="flex flex-col items-center gap-6 py-24 text-center">
          <h1 className="text-heading font-bold">NFT não encontrado</h1>
          <p className="text-text-secondary">Este NFT não existe ou foi removido do marketplace.</p>
          <Link to="/" hash="catalogo" className={buttonVariants()}>
            Explorar o catálogo
          </Link>
        </div>
      )
    }
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-heading font-bold">Não foi possível carregar este NFT</h1>
        <p className="text-text-secondary">{apiError.message}</p>
        <Button
          onClick={() => {
            void refetch()
          }}
          disabled={isFetching}
        >
          {isFetching ? 'Tentando novamente…' : 'Tentar novamente'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12 lg:gap-24">
      <NftDetailView
        nft={data}
        favoriteAction={<FavoriteButton nftId={data.id} nftName={data.name} />}
      />
      <RelatedNfts title="Mais desta coleção" collection={data.collection} excludeIds={[data.id]} />
    </div>
  )
}
