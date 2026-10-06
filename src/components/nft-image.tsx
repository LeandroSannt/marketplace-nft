import type { Artwork } from '@/contracts/nft'
import { cn } from '@/lib/utils'

const WIDTHS = [320, 640, 1024] as const

interface NftImageProps {
  artwork: Artwork
  alt: string
  sizes: string
  priority?: boolean
  className?: string
  width?: number
  height?: number
}

function nftImageSrc(artwork: Artwork, width: (typeof WIDTHS)[number] = 640) {
  return `/nfts/${artwork}-${width}.webp`
}

export function NftImage({
  artwork,
  alt,
  sizes,
  priority = false,
  className,
  width = 640,
  height = 640,
}: NftImageProps) {
  return (
    <img
      src={nftImageSrc(artwork)}
      srcSet={WIDTHS.map((size) => `${nftImageSrc(artwork, size)} ${size}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn('aspect-square object-cover', className)}
    />
  )
}
