import { Link } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'
import { NftImage } from '@/components/nft-image'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const HERO_NFT_ID = 'emerald-ape-042'

function CarouselDots({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('gap-2', className)}>
      <span className="size-2 rounded-full bg-primary" />
      <span className="size-2 rounded-full bg-primary/60" />
      <span className="size-2 rounded-full bg-primary/60" />
    </span>
  )
}

export function HomeHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-47.5 items-center justify-between gap-3 overflow-hidden rounded-4xl bg-linear-to-br from-primary/45 via-surface-dark to-surface-card px-4 pt-3.5 pb-7 md:min-h-0 md:gap-8 md:rounded-none md:bg-none md:p-0 md:pl-10 lg:h-112.5"
    >
      <span
        aria-hidden
        className="absolute -top-16 left-24 -z-10 size-64 rounded-full bg-foreground/5 md:hidden"
      />
      <span
        aria-hidden
        className="absolute top-20 -left-20 -z-10 size-56 rounded-full bg-foreground/5 md:hidden"
      />
      <div className="flex max-w-150 min-w-0 flex-1 flex-col gap-1 md:gap-11">
        <div className="flex flex-col gap-1 md:gap-2">
          <p className="text-caption-sm font-medium tracking-[0.1em] md:text-body">
            Bem-vindo à Kurio
          </p>
          <h1
            id="hero-title"
            className="max-w-135 text-body-xl leading-7.25 font-bold uppercase md:text-[34px] md:leading-13 lg:text-display-lg lg:leading-17.5"
          >
            <span className="md:hidden">Seja dono da cultura digital</span>
            <span className="hidden md:inline">Seja dono do futuro da arte digital</span>
          </h1>
          <p className="max-w-139.25 text-caption-sm leading-4.5 text-text-secondary md:mt-2 md:text-body md:leading-6">
            <span className="md:hidden">
              Descubra NFTs selecionados de criadores do mundo todo.
            </span>
            <span className="hidden md:inline">
              Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
              digital rara, apoie artistas e tenha uma parte da cultura da internet.
            </span>
          </p>
        </div>
        <Link
          to="/"
          hash="catalogo"
          className="flex w-fit items-center gap-2 text-caption-sm font-bold text-text-accent uppercase md:hidden"
        >
          Explorar
          <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
        <div className="hidden items-center justify-between md:flex">
          <Link
            to="/"
            hash="catalogo"
            className={cn(buttonVariants(), 'h-10 w-fit pr-9 pl-7 text-body-lg uppercase')}
          >
            Explorar
          </Link>
          <CarouselDots className="flex" />
        </div>
      </div>
      <div className="relative w-34.5 shrink-0 sm:w-45 md:w-75 lg:w-112.5">
        <Link to="/nfts/$nftId" params={{ nftId: HERO_NFT_ID }} aria-label="Ver Emerald Ape #042">
          <NftImage
            artwork="emerald"
            alt="Arte do NFT Emerald Ape #042: macaco de óculos redondos e jaqueta varsity verde"
            sizes="(min-width: 1024px) 450px, (min-width: 768px) 300px, 180px"
            priority
            width={450}
            height={450}
            className="w-full rounded-2xl md:rounded-4xl"
          />
        </Link>
        <NftImage
          artwork="violet"
          alt=""
          sizes="64px"
          width={58}
          height={58}
          className="absolute top-22 left-3.5 size-14.5 rounded-xl md:hidden"
        />
      </div>
      <CarouselDots className="absolute bottom-2 left-1/2 flex -translate-x-1/2 md:hidden" />
    </section>
  )
}
