import { useState } from 'react'
import { NftImage } from '@/components/nft-image'
import type { Artwork } from '@/contracts/nft'
import { cn } from '@/lib/utils'

interface NftGalleryProps {
  name: string
  gallery: Artwork[]
}

export function NftGallery({ name, gallery }: NftGalleryProps) {
  const [selected, setSelected] = useState(0)
  const current = gallery[selected] ?? gallery[0] ?? 'emerald'

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-7">
      <ul aria-label="Imagens do NFT" className="flex gap-4 md:flex-col">
        {gallery.map((artwork, index) => (
          <li key={`${artwork}-${index}`}>
            <button
              type="button"
              aria-pressed={index === selected}
              aria-label={`Ver imagem ${index + 1} de ${gallery.length}`}
              onClick={() => {
                setSelected(index)
              }}
              className={cn(
                'block size-18 cursor-pointer overflow-hidden rounded-lg border bg-surface-card md:size-25',
                index === selected
                  ? 'border-primary ring-2 ring-primary'
                  : 'border-transparent hover:border-border-soft',
              )}
            >
              <NftImage
                artwork={artwork}
                alt=""
                sizes="100px"
                width={100}
                height={100}
                className="size-full"
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="aspect-square w-full rounded-md bg-surface-card p-4 md:size-111 md:shrink-0">
        <NftImage
          artwork={current}
          alt={`Arte do NFT ${name}, imagem ${selected + 1} de ${gallery.length}`}
          sizes="(min-width: 768px) 404px, 90vw"
          priority
          width={404}
          height={404}
          className="size-full rounded-4xl"
        />
      </div>
    </div>
  )
}
