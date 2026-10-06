import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { NftImage } from '@/components/nft-image'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { featuredQuery } from '@/features/catalog/queries'

export function FeaturedBanner() {
  const { data, isError, refetch } = useQuery(featuredQuery())
  const spotlight = data?.spotlight

  return (
    <section
      aria-labelledby="featured-banner-title"
      className="relative flex h-117.5 flex-col gap-4 overflow-hidden bg-gradient-card pt-6"
    >
      <div className="flex flex-col gap-4 px-5">
        <h2
          id="featured-banner-title"
          className="text-heading font-bold text-text-accent uppercase"
        >
          NFT em destaque
        </h2>
        <p className="text-center text-title-lg font-bold uppercase">Oferta limitada</p>
      </div>
      {spotlight ? (
        <Link
          to="/nfts/$nftId"
          params={{ nftId: spotlight.id }}
          aria-label={`Ver ${spotlight.name}`}
          className="mt-auto block"
        >
          <NftImage
            artwork={spotlight.artwork}
            alt={`Arte do NFT ${spotlight.name}`}
            sizes="310px"
            width={310}
            height={368}
            className="h-92 w-full rounded-[22px]"
          />
        </Link>
      ) : isError ? (
        <div
          role="alert"
          className="mt-auto flex h-92 flex-col items-center justify-center gap-4 rounded-[22px] bg-surface-raised px-6 text-center"
        >
          <p className="text-body text-text-secondary">Não foi possível carregar o destaque.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void refetch()
            }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <Skeleton className="mt-auto h-92 rounded-[22px]" />
      )}
    </section>
  )
}
