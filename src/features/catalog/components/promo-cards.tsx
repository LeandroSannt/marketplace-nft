import { Link } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'
import { NftImage } from '@/components/nft-image'
import { buttonVariants } from '@/components/ui/button'
import type { Artwork } from '@/contracts/nft'
import type { CatalogSearch } from '@/features/catalog/search'
import { cn } from '@/lib/utils'

interface Promo {
  title: string
  text: string
  artwork: Artwork
  search: CatalogSearch
}

const PROMOS: Promo[] = [
  {
    title: 'Lançamentos gênesis de edição limitada',
    text: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    artwork: 'emerald',
    search: { tab: 'new' },
  },
  {
    title: 'Arte digital selecionada e muito mais',
    text: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
    artwork: 'onyx',
    search: { collections: ['digital-art'] },
  },
]

export function PromoCards() {
  return (
    <section aria-label="Destaques do mercado" className="grid gap-6 lg:grid-cols-2">
      {PROMOS.map((promo) => (
        <article
          key={promo.title}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-lg bg-surface-card md:h-62.5 md:grid-rows-1"
        >
          <NftImage
            artwork={promo.artwork}
            alt=""
            sizes="(min-width: 1024px) 290px, 50vw"
            width={287}
            height={250}
            className="h-full w-full rounded-[17px] md:aspect-auto"
          />
          <div className="flex flex-col items-end justify-center gap-3 p-4 text-right md:px-8 md:py-4">
            <h2 className="text-body-lg font-bold md:text-body-xl">{promo.title}</h2>
            <p className="line-clamp-3 text-caption leading-5.5 text-text-secondary md:text-body md:leading-6">
              {promo.text}
            </p>
            <Link
              to="/"
              search={promo.search}
              hash="catalogo"
              className={cn(buttonVariants(), 'h-10 w-35 gap-1 text-body font-medium')}
            >
              Explorar
              <ArrowRightIcon className="size-4" aria-hidden />
              <span className="sr-only">: {promo.title}</span>
            </Link>
          </div>
        </article>
      ))}
    </section>
  )
}
