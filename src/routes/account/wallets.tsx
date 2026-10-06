import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { walletSlotSchema } from '@/contracts/wallet'
import { WalletForm } from '@/features/account/components/wallet-form'
import { walletsQuery } from '@/features/account/queries'
import { toApiError } from '@/lib/api-error'
import { useSession } from '@/lib/session-store'

export const Route = createFileRoute('/account/wallets')({
  head: () => ({ meta: [{ title: 'Carteiras — Kurio' }] }),
  component: WalletsPage,
})

function WalletsPage() {
  const { userId } = useSession()
  const wallets = useQuery({ ...walletsQuery(userId ?? ''), enabled: Boolean(userId) })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-title font-bold">Carteiras</h1>
        <p className="text-body text-text-secondary">
          Estas carteiras ficam disponíveis no pagamento. Cadastre uma principal e, se quiser, uma
          secundária.
        </p>
      </div>
      {wallets.isPending && (
        <div role="status" aria-label="Carregando carteiras" className="flex flex-col gap-6">
          <Skeleton className="h-90" />
          <Skeleton className="h-90" />
        </div>
      )}
      {wallets.isError && (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p className="text-body text-text-secondary">{toApiError(wallets.error).message}</p>
          <Button
            onClick={() => {
              void wallets.refetch()
            }}
          >
            Tentar novamente
          </Button>
        </div>
      )}
      {userId &&
        wallets.data &&
        walletSlotSchema.options.map((slot) => {
          const wallet = wallets.data.items.find((item) => item.slot === slot)
          return (
            <WalletForm
              key={`${slot}-${wallet?.id ?? 'new'}`}
              userId={userId}
              slot={slot}
              wallet={wallet}
            />
          )
        })}
    </div>
  )
}
