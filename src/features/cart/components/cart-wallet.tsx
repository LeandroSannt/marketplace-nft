import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { WalletIcon } from 'lucide-react'
import { walletsQuery } from '@/features/account/queries'
import { NETWORK_LABELS } from '@/lib/labels'

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function UserWallet({ userId }: { userId: string }) {
  const { data, isPending } = useQuery(walletsQuery(userId))
  const wallet = data?.items.find((item) => item.slot === 'primary') ?? data?.items[0]

  if (isPending) return <p className="text-body text-text-secondary">Carregando carteira…</p>

  if (!wallet) {
    return (
      <p className="text-body text-text-secondary">
        Nenhuma carteira cadastrada.{' '}
        <Link to="/account/wallets" className="font-bold text-text-accent hover:underline">
          Cadastrar carteira
        </Link>
      </p>
    )
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-body leading-5.5">{wallet.ens || wallet.label}</span>
        <span className="text-body leading-5.5 text-text-secondary">
          {shortAddress(wallet.address)} · Rede {NETWORK_LABELS[wallet.network]}
        </span>
      </div>
      <Link
        to="/account/wallets"
        className="text-body font-bold whitespace-nowrap text-text-accent hover:underline"
      >
        Trocar carteira
      </Link>
    </div>
  )
}

export function CartWallet({ userId }: { userId: string | null }) {
  return (
    <section
      aria-labelledby="cart-wallet-title"
      className="flex flex-col gap-3 rounded-lg bg-surface-raised p-4"
    >
      <h2 id="cart-wallet-title" className="flex items-center gap-2 text-body-lg font-bold">
        <WalletIcon className="size-5 text-text-accent" aria-hidden />
        {userId ? 'Carteira principal' : 'Carteira'}
      </h2>
      {userId ? (
        <UserWallet userId={userId} />
      ) : (
        <p className="text-body text-text-secondary">
          <Link
            to="/login"
            search={{ redirect: '/cart' }}
            className="font-bold text-text-accent hover:underline"
          >
            Entre na sua conta
          </Link>{' '}
          para usar suas carteiras no pagamento.
        </p>
      )}
    </section>
  )
}
