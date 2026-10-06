import { Link } from '@tanstack/react-router'
import { useId, useState, type SyntheticEvent } from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import { Brand } from '@/components/layout/brand'
import { Button } from '@/components/ui/button'
import { COLLECTION_LABELS } from '@/lib/labels'
import { announceComingSoon } from '@/lib/coming-soon'
import type { Collection } from '@/contracts/nft'

const FEATURES = [
  {
    mark: 'W',
    title: 'Segurança da carteira',
    text: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    mark: 'C',
    title: 'Criadores em destaque',
    text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    mark: 'D',
    title: 'Alertas de lançamentos',
    text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
]

const FOOTER_COLLECTIONS: Collection[] = [
  'digital-art',
  'photography',
  'music',
  '3d-art',
  'utility',
]

const SOCIALS = [
  { label: 'Facebook', icon: FaFacebookF },
  { label: 'Instagram', icon: FaInstagram },
  { label: 'X', icon: FaXTwitter },
  { label: 'LinkedIn', icon: FaLinkedinIn },
  { label: 'YouTube', icon: FaYoutube },
]

const linkClass = 'text-body-md leading-7.5 text-foreground hover:text-text-accent'

function SoonLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={`${linkClass} cursor-pointer text-left`}
      onClick={() => {
        announceComingSoon(label)
      }}
    >
      {label}
    </button>
  )
}

function Newsletter() {
  const inputId = useId()
  const [email, setEmail] = useState('')

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    announceComingSoon('A newsletter')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-body-xl leading-4 font-bold">Antecipe-se ao próximo lançamento</h2>
      <label htmlFor={inputId} className="sr-only">
        Seu e-mail
      </label>
      <div className="flex h-9 overflow-hidden rounded-xs border border-border">
        <input
          id={inputId}
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
          }}
          placeholder="digite seu e-mail..."
          className="min-w-0 flex-1 bg-surface-raised px-3 text-body text-foreground placeholder:text-secondary"
        />
        <Button type="submit" className="h-full rounded-none px-4 text-body-xl">
          Enviar
        </Button>
      </div>
      <p className="text-caption leading-5.5 text-text-secondary">
        Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
      </p>
    </form>
  )
}

export function SiteFooter() {
  return (
    <footer className="mx-auto hidden w-full max-w-content md:block">
      <div className="grid gap-8 bg-surface-card p-8 lg:grid-cols-[repeat(3,1fr)_1.25fr]">
        {FEATURES.map((feature) => (
          <section
            key={feature.title}
            className="flex flex-col gap-4 lg:border-r lg:border-primary lg:pr-8"
          >
            <span
              aria-hidden
              className="grid size-18.5 place-items-center rounded-full bg-primary text-heading font-bold text-ink"
            >
              {feature.mark}
            </span>
            <h2 className="text-body-xl font-bold">{feature.title}</h2>
            <p className="text-body-md leading-5.5 text-text-secondary">{feature.text}</p>
          </section>
        ))}
        <Newsletter />
      </div>

      <div className="grid gap-4 bg-surface-dark px-8 py-6 md:grid-cols-4 md:items-center">
        <Brand />
        <p className="text-body leading-5.5">Feito para colecionadores, criadores e cultura</p>
        <a href="mailto:contato@email.com" className="text-body hover:text-text-accent">
          contato@email.com
        </a>
        <a href="tel:+551140028922" className="text-body hover:text-text-accent">
          +55 11 4002 8922
        </a>
      </div>

      <div className="grid gap-8 bg-surface-card px-8 py-6 md:grid-cols-4">
        <nav aria-labelledby="footer-profile">
          <h2 id="footer-profile" className="mb-2 text-body-xl font-bold">
            Meu perfil
          </h2>
          <ul>
            <li>
              <Link to="/account/profile" className={linkClass}>
                Meu perfil
              </Link>
            </li>
            <li>
              <Link to="/account/wallets" className={linkClass}>
                Minhas carteiras
              </Link>
            </li>
            <li>
              <Link to="/cart" className={linkClass}>
                Carrinho
              </Link>
            </li>
            <li>
              <SoonLink label="Lista de interesse" />
            </li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-help">
          <h2 id="footer-help" className="mb-2 text-body-xl font-bold">
            Central de ajuda
          </h2>
          <ul>
            {[
              'Central de ajuda',
              'Como comprar NFTs',
              'Carteira e segurança',
              'Política do mercado',
            ].map((label) => (
              <li key={label}>
                <SoonLink label={label} />
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="footer-collections">
          <h2 id="footer-collections" className="mb-2 text-body-xl font-bold">
            Coleções
          </h2>
          <ul>
            {FOOTER_COLLECTIONS.map((collection) => (
              <li key={collection}>
                <Link
                  to="/"
                  search={{ collections: [collection] }}
                  hash="catalogo"
                  className={linkClass}
                >
                  {COLLECTION_LABELS[collection]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-6">
          <section aria-labelledby="footer-social">
            <h2 id="footer-social" className="mb-3 text-body-xl font-bold">
              Redes sociais
            </h2>
            <ul className="flex gap-2">
              {SOCIALS.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <button
                    type="button"
                    aria-label={label}
                    onClick={() => {
                      announceComingSoon(`O perfil da Kurio no ${label}`)
                    }}
                    className="grid size-8 cursor-pointer place-items-center rounded-xs border border-primary text-primary hover:bg-primary hover:text-ink"
                  >
                    <Icon className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="footer-wallets">
            <h2 id="footer-wallets" className="mb-3 text-body-xl font-bold">
              Carteiras compatíveis
            </h2>
            <p className="inline-flex gap-2 rounded-xs border border-border bg-surface-raised px-3 py-2 text-micro font-bold tracking-[0.1px] text-text-accent uppercase">
              MetaMask · WalletConnect · Coinbase
            </p>
          </section>
        </div>
      </div>

      <p className="py-6 text-center text-body">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  )
}
