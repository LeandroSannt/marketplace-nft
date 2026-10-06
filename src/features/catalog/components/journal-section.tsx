import { NftImage } from '@/components/nft-image'
import type { Artwork } from '@/contracts/nft'
import { announceComingSoon } from '@/lib/coming-soon'

interface Article {
  title: string
  excerpt: string
  date: string
  readingMinutes: number
  artwork: Artwork
}

const ARTICLES: Article[] = [
  {
    title: 'Como funciona a propriedade de NFTs',
    excerpt: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    date: '12 de setembro',
    readingMinutes: 6,
    artwork: 'onyx',
  },
  {
    title: '10 artistas digitais para acompanhar',
    excerpt: 'Conheça criadores que moldam a cultura digital.',
    date: '13 de setembro',
    readingMinutes: 2,
    artwork: 'emerald',
  },
  {
    title: 'Raridade, atributos e procedência',
    excerpt: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    date: '15 de setembro',
    readingMinutes: 3,
    artwork: 'violet',
  },
  {
    title: 'Como proteger sua carteira',
    excerpt: 'Proteja sua carteira, seus ativos e sua identidade.',
    date: '15 de setembro',
    readingMinutes: 2,
    artwork: 'amber',
  },
]

export function JournalSection() {
  return (
    <section aria-labelledby="journal-title" className="flex flex-col gap-10">
      <header className="flex flex-col gap-3 text-center">
        <h2 id="journal-title" className="text-title font-bold md:text-heading-lg md:leading-6">
          Diário da Cunhagem
        </h2>
        <p className="text-body text-text-secondary">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </header>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ARTICLES.map((article) => (
          <li key={article.title}>
            <article className="flex h-full flex-col overflow-hidden rounded-lg bg-surface-card">
              <NftImage
                artwork={article.artwork}
                alt=""
                sizes="(min-width: 1024px) 268px, (min-width: 640px) 50vw, 100vw"
                width={268}
                height={195}
                className="aspect-[268/195] w-full object-cover"
              />
              <div className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-4">
                <p className="text-caption-sm text-text-secondary">
                  {article.date} <span aria-hidden>|</span> Leitura de {article.readingMinutes} min
                </p>
                <h3 className="text-body-lg font-bold">{article.title}</h3>
                <p className="text-caption-sm text-text-secondary">{article.excerpt}</p>
                <button
                  type="button"
                  onClick={() => {
                    announceComingSoon('O Diário da Cunhagem')
                  }}
                  className="mt-auto w-fit cursor-pointer text-caption-sm font-bold text-text-accent hover:underline"
                >
                  Ler mais <span aria-hidden>→</span>
                  <span className="sr-only">: {article.title}</span>
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
