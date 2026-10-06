import { Link } from '@tanstack/react-router'
import { HeartIcon } from 'lucide-react'
import { NftImage } from '@/components/nft-image'
import { Skeleton } from '@/components/ui/skeleton'
import type { NftSummary } from '@/contracts/nft'
import { formatEth } from '@/lib/money'

const CARD_IMAGE_SIZES = '(min-width: 1024px) 250px, (min-width: 768px) 30vw, 45vw'

interface NftCardProps {
  nft: NftSummary
  isFavorite?: boolean
  priority?: boolean
}

export function NftCard({ nft, isFavorite = false, priority = false }: NftCardProps) {
  const soldOut = nft.available === 0

  return (
    <article className="group relative flex flex-col gap-3">
      <div className="relative aspect-[258/300] rounded-3xl bg-surface-card md:rounded-lg">
        <div className="absolute inset-x-1 top-3 bottom-5 md:top-6 md:bottom-7">
          <NftImage
            artwork={nft.artwork}
            alt={`Arte do NFT ${nft.name}`}
            sizes={CARD_IMAGE_SIZES}
            priority={priority}
            className="aspect-auto size-full rounded-[15px] transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {nft.isRare && (
            <span className="absolute top-0 left-0 rounded-tl-[15px] rounded-br-md bg-primary px-3 py-1.5 text-caption-sm font-medium text-ink uppercase">
              Raro
            </span>
          )}
          {isFavorite && (
            <span className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-ink/80">
              <HeartIcon className="size-4 fill-primary text-primary" aria-hidden />
              <span className="sr-only">Nos seus favoritos</span>
            </span>
          )}
          {soldOut && (
            <span className="absolute bottom-2 left-2 rounded-xs bg-ink/90 px-2 py-1 text-caption-sm font-bold text-text-coral">
              Esgotado
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-body-md">
          <Link
            to="/nfts/$nftId"
            params={{ nftId: nft.id }}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-primary"
          >
            {nft.name}
          </Link>
        </h3>
        <p className="text-body-xl leading-4 font-bold text-text-accent">
          <span className="sr-only">Preço a partir de </span>
          {formatEth(nft.price)}
        </p>
      </div>
    </article>
  )
}

export function NftCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 max-md:even:translate-y-8" aria-hidden>
      <Skeleton className="aspect-[258/300] rounded-3xl md:rounded-lg" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  )
}
