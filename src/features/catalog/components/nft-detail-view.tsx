import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { ChevronLeftIcon, LinkIcon, StarIcon } from 'lucide-react'
import { Tabs } from 'radix-ui'
import { FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'
import { toast } from 'sonner'
import type { NftDetail } from '@/contracts/nft'
import { NftGallery } from '@/features/catalog/components/nft-gallery'
import { NftPurchasePanel } from '@/features/catalog/components/nft-purchase-panel'
import { COLLECTION_LABELS, NETWORK_LABELS } from '@/lib/labels'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'

function tokenId(name: string) {
  const serial = /#(\d+)/.exec(name)?.[1] ?? '0'
  return `#${serial.padStart(4, '0')}`
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function Rating({ rating, count }: { rating: number; count: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-1">
      <span className="sr-only">Avaliação {rating.toLocaleString('pt-BR')} de 5.</span>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          aria-hidden
          className={cn('size-3.75', index < filled ? 'fill-amber text-amber' : 'text-border-soft')}
        />
      ))}
      <span className="ml-2 text-body-md">{count} avaliações de colecionadores</span>
    </div>
  )
}

function RatingPill({ rating, count }: { rating: number; count: number }) {
  return (
    <p className="flex shrink-0 items-center gap-1 rounded-pill border border-primary px-2 py-1 text-caption-sm">
      <StarIcon className="size-3.5 fill-amber text-amber" aria-hidden />
      <span className="sr-only">Avaliação</span>
      {rating.toLocaleString('pt-BR')}
      <span className="text-text-secondary">
        ({count}
        <span className="sr-only"> avaliações</span>)
      </span>
    </p>
  )
}

function MobileTopBar({ favoriteAction }: { favoriteAction: React.ReactNode }) {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  return (
    <div className="flex items-center justify-between md:hidden">
      <button
        type="button"
        aria-label="Voltar"
        onClick={() => {
          if (canGoBack) router.history.back()
          else void navigate({ to: '/', hash: 'catalogo' })
        }}
        className="grid size-11 cursor-pointer place-items-center rounded-full bg-surface-card text-foreground"
      >
        <ChevronLeftIcon className="size-5" aria-hidden />
      </button>
      {favoriteAction}
    </div>
  )
}

function ShareLinks({ name }: { name: string }) {
  const url = window.location.href
  const text = encodeURIComponent(`${name} na Kurio`)
  const shareUrl = encodeURIComponent(url)
  const iconClass = 'grid size-8 place-items-center text-foreground hover:text-text-accent'

  return (
    <div className="flex items-center gap-2">
      <span className="text-body-md font-bold">Compartilhar este NFT:</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Compartilhar no LinkedIn (abre em nova aba)"
        className={iconClass}
      >
        <FaLinkedinIn className="size-4" aria-hidden />
      </a>
      <button
        type="button"
        aria-label="Copiar link do NFT"
        className={cn(iconClass, 'cursor-pointer')}
        onClick={() => {
          void navigator.clipboard
            .writeText(url)
            .then(() => toast.success('Link copiado.'))
            .catch(() => toast.error('Não foi possível copiar o link.'))
        }}
      >
        <LinkIcon className="size-4" aria-hidden />
      </button>
      <a
        href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Compartilhar no X (abre em nova aba)"
        className={iconClass}
      >
        <FaXTwitter className="size-4" aria-hidden />
      </a>
    </div>
  )
}

function DetailTabs({ nft }: { nft: NftDetail }) {
  const triggerClass =
    '-mb-px cursor-pointer border-b-3 border-transparent pb-3 text-section text-foreground hover:text-text-accent data-[state=active]:border-primary data-[state=active]:font-bold data-[state=active]:text-text-accent'

  return (
    <Tabs.Root defaultValue="details" className="flex flex-col gap-3">
      <Tabs.List aria-label="Informações do NFT" className="flex gap-8 border-b border-primary/40">
        <Tabs.Trigger value="details" className={triggerClass}>
          Detalhes do NFT
        </Tabs.Trigger>
        <Tabs.Trigger value="reviews" className={triggerClass}>
          Avaliações de colecionadores ({nft.reviewsCount})
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content
        value="details"
        className="flex flex-col text-body leading-6 text-text-secondary"
      >
        <p>
          {nft.name} é uma obra digital da coleção {COLLECTION_LABELS[nft.collection]}, criada por{' '}
          {nft.creator}. {nft.description}
        </p>
        <p className="mt-3 font-bold text-foreground">Rede:</p>
        <p>
          Cunhado na {NETWORK_LABELS[nft.network]} com procedência imutável e metadados verificados.
        </p>
        <p className="font-bold text-foreground">Contrato:</p>
        <p>{shortAddress(nft.contractAddress)} • Contrato inteligente ERC-721 verificado</p>
        <p className="font-bold text-foreground">Direitos autorais:</p>
        <p>
          Direitos autorais do criador: {nft.royaltiesPercent.toLocaleString('pt-BR')}% nas vendas
          secundárias.
        </p>
      </Tabs.Content>
      <Tabs.Content value="reviews" className="flex flex-col gap-2 py-2">
        <Rating rating={nft.rating} count={nft.reviewsCount} />
        <p className="text-body text-text-secondary">
          Nota média {nft.rating.toLocaleString('pt-BR')} de 5 em {nft.reviewsCount} avaliações.
        </p>
      </Tabs.Content>
    </Tabs.Root>
  )
}

interface NftDetailViewProps {
  nft: NftDetail
  favoriteAction: React.ReactNode
  compactFavoriteAction: React.ReactNode
}

export function NftDetailView({ nft, favoriteAction, compactFavoriteAction }: NftDetailViewProps) {
  return (
    <div className="flex flex-col gap-12 lg:gap-24">
      <article className="flex flex-col gap-4 md:gap-8 lg:flex-row">
        <MobileTopBar favoriteAction={compactFavoriteAction} />
        <NftGallery name={nft.name} gallery={nft.gallery} />
        <div className="relative flex min-w-0 flex-1 flex-col gap-6 max-md:-mx-4 max-md:-mt-14 max-md:rounded-t-[30px] max-md:bg-surface-card max-md:px-6 max-md:pt-6 max-md:pb-8">
          <header className="flex flex-col gap-3 md:border-b md:border-primary/40 md:pb-3">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-title font-bold md:text-heading-lg">{nft.name}</h1>
              <div className="md:hidden">
                <RatingPill rating={nft.rating} count={nft.reviewsCount} />
              </div>
            </div>
            <div className="hidden flex-wrap items-center justify-between gap-2 md:flex">
              <p aria-live="polite" className="text-title-lg leading-4 font-bold text-text-accent">
                <span className="sr-only">Preço a partir de </span>
                {formatEth(nft.price)}
              </p>
              <Rating rating={nft.rating} count={nft.reviewsCount} />
            </div>
          </header>
          <section aria-labelledby="about-title" className="flex flex-col gap-3">
            <h2 id="about-title" className="text-body-md font-bold max-md:sr-only">
              Sobre este NFT:
            </h2>
            <p className="text-body leading-6 text-text-secondary">{nft.description}</p>
          </section>
          <NftPurchasePanel key={nft.id} nft={nft} favoriteAction={favoriteAction} />
          <dl className="flex flex-col gap-3 text-body-md text-secondary">
            <div className="flex gap-1">
              <dt>ID do token:</dt>
              <dd>{tokenId(nft.name)}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Coleção:</dt>
              <dd>{COLLECTION_LABELS[nft.collection]}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Criador:</dt>
              <dd>{nft.creator}</dd>
            </div>
          </dl>
          <ShareLinks name={nft.name} />
        </div>
      </article>
      <DetailTabs nft={nft} />
    </div>
  )
}
