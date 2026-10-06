import { Link } from '@tanstack/react-router'
import { NftImage } from '@/components/nft-image'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const HERO_NFT_ID = 'emerald-ape-042'

export function HomeHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="flex items-center justify-between gap-4 overflow-hidden rounded-3xl bg-gradient-card p-5 md:gap-8 md:rounded-none md:bg-none md:p-0 md:pl-10 lg:h-112.5"
    >
      <div className="flex max-w-150 min-w-0 flex-1 flex-col gap-4 md:gap-11">
        <div className="flex flex-col gap-1 md:gap-2">
          <p className="text-caption-sm font-medium tracking-[0.1em] md:text-body">
            Bem-vindo à Kurio
          </p>
          <h1
            id="hero-title"
            className="max-w-135 text-body-xl leading-[29px] font-bold uppercase md:text-[34px] md:leading-13 lg:text-display-lg lg:leading-17.5"
          >
            Seja dono do futuro da arte digital
          </h1>
          <p className="mt-1 max-w-[557px] text-caption-sm leading-4.5 text-text-secondary md:mt-2 md:text-body md:leading-6">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            <span className="hidden md:inline">
              {' '}
              Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
            </span>
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Link
            to="/"
            hash="catalogo"
            className={cn(
              buttonVariants(),
              'h-8 w-fit px-4 text-caption-sm uppercase md:h-10 md:pr-9 md:pl-7 md:text-body-lg',
            )}
          >
            Explorar
          </Link>
          <span aria-hidden className="hidden gap-2 md:flex">
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-primary/60" />
            <span className="size-2 rounded-full bg-primary/60" />
          </span>
        </div>
      </div>
      <Link
        to="/nfts/$nftId"
        params={{ nftId: HERO_NFT_ID }}
        aria-label="Ver Emerald Ape #042"
        className="w-30 shrink-0 sm:w-45 md:w-75 lg:w-112.5"
      >
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
    </section>
  )
}
