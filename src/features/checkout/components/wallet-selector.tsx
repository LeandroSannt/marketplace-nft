import { Link } from '@tanstack/react-router'
import { CheckCircle2Icon, Loader2Icon, PlugZapIcon, XCircleIcon } from 'lucide-react'
import { RadioGroup } from 'radix-ui'
import { useId } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { networkSchema, type Network } from '@/contracts/common'
import type { Wallet, WalletProvider } from '@/contracts/wallet'
import { NETWORK_LABELS } from '@/lib/labels'
import { cn } from '@/lib/utils'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'rejected' | 'disconnected'

const PROVIDER_MARK: Record<WalletProvider, string> = {
  metamask: 'M',
  walletconnect: 'W',
  coinbase: 'C',
  phantom: 'P',
}

const PROVIDER_NAME: Record<WalletProvider, string> = {
  metamask: 'MetaMask',
  walletconnect: 'WalletConnect',
  coinbase: 'Coinbase Wallet',
  phantom: 'Phantom',
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

interface WalletSelectorProps {
  wallets: Wallet[]
  selectedId: string | null
  network: Network
  status: ConnectionStatus
  connectionError: string | null
  error?: string
  onSelect: (walletId: string) => void
  onNetworkChange: (network: Network) => void
  onConnect: () => void
  onDisconnect: () => void
}

function StatusMessage({ status, error }: { status: ConnectionStatus; error: string | null }) {
  if (status === 'connecting') {
    return (
      <span className="flex items-center gap-2 text-text-secondary">
        <Loader2Icon className="size-4 animate-spin" aria-hidden /> Aguardando a carteira…
      </span>
    )
  }
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-2 text-success">
        <CheckCircle2Icon className="size-4" aria-hidden /> Carteira conectada
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="flex items-center gap-2 text-error-foreground">
        <XCircleIcon className="size-4" aria-hidden /> {error ?? 'A carteira recusou a conexão.'}
      </span>
    )
  }
  if (status === 'disconnected') {
    return (
      <span className="text-text-secondary">Carteira desconectada. Conecte para continuar.</span>
    )
  }
  return <span className="text-text-secondary">Conecte a carteira para revisar o pedido.</span>
}

export function WalletSelector({
  wallets,
  selectedId,
  network,
  status,
  connectionError,
  error,
  onSelect,
  onNetworkChange,
  onConnect,
  onDisconnect,
}: WalletSelectorProps) {
  const labelId = useId()
  const networkId = useId()
  const errorId = useId()

  if (wallets.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-lg bg-surface-raised p-4">
        <p className="text-body text-text-secondary">Você ainda não tem carteiras cadastradas.</p>
        <Link to="/account/wallets" className="w-fit font-bold text-text-accent hover:underline">
          Cadastrar carteira
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <p id={labelId} className="sr-only">
        Selecione a carteira de pagamento
      </p>
      <RadioGroup.Root
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        value={selectedId ?? ''}
        onValueChange={onSelect}
        className="flex flex-col gap-5"
      >
        {wallets.map((wallet) => (
          <RadioGroup.Item
            key={wallet.id}
            value={wallet.id}
            className={cn(
              'group flex min-h-23.25 w-full min-w-0 cursor-pointer items-center gap-4 rounded-2xl border border-border bg-gradient-card p-4 text-left shadow-card',
              'data-[state=checked]:border-primary',
            )}
          >
            <span
              aria-hidden
              className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-heading font-bold text-ink"
            >
              {PROVIDER_MARK[wallet.provider]}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body-lg font-bold">
                {wallet.slot === 'primary' ? 'Carteira principal' : 'Carteira secundária'} ·{' '}
                {PROVIDER_NAME[wallet.provider]}
              </span>
              <span className="truncate text-body leading-5.5 text-text-secondary">
                {wallet.ens || wallet.label} · {shortAddress(wallet.address)}
              </span>
              <span className="text-body leading-5.5 text-text-secondary">
                Rede {NETWORK_LABELS[wallet.network]}
              </span>
            </span>
            <CheckCircle2Icon
              aria-hidden
              className="size-6 shrink-0 text-primary opacity-0 group-data-[state=checked]:opacity-100"
            />
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
      {error && (
        <p id={errorId} className="text-caption-sm text-error-foreground">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        <label htmlFor={networkId} className="text-body-md">
          Rede de pagamento
        </label>
        <Select
          value={network}
          onValueChange={(value) => {
            const parsed = networkSchema.safeParse(value)
            if (parsed.success) onNetworkChange(parsed.data)
          }}
        >
          <SelectTrigger id={networkId} className="h-10 w-full rounded-sm border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {networkSchema.options.map((option) => (
              <SelectItem key={option} value={option}>
                {NETWORK_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-raised p-4">
        <p role="status" className="text-body">
          <StatusMessage status={status} error={connectionError} />
        </p>
        {status === 'connected' ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDisconnect}
            className="w-auto px-4"
          >
            Desconectar
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={onConnect}
            disabled={!selectedId || status === 'connecting'}
            aria-busy={status === 'connecting'}
            className="gap-2"
          >
            <PlugZapIcon className="size-4" aria-hidden />
            {status === 'rejected' ? 'Tentar novamente' : 'Conectar carteira'}
          </Button>
        )}
      </div>
    </div>
  )
}
