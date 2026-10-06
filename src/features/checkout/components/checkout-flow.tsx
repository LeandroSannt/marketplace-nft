import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { AlertTriangleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { TextField } from '@/components/form-field'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { User } from '@/contracts/auth'
import type { Network } from '@/contracts/common'
import { buyerSchema, type Buyer, type CreateOrderRequest } from '@/contracts/order'
import { quoteSchema, type Quote } from '@/contracts/quote'
import type { Wallet } from '@/contracts/wallet'
import { useConnectWallet, useDisconnectWallet } from '@/features/account/queries'
import { NETWORK_LABELS } from '@/lib/labels'
import { OrderLines } from '@/features/checkout/components/order-lines'
import { OrderTotals } from '@/features/checkout/components/order-totals'
import {
  WalletSelector,
  type ConnectionStatus,
} from '@/features/checkout/components/wallet-selector'
import { clearCheckoutDraft, readCheckoutDraft, saveCheckoutDraft } from '@/features/checkout/draft'
import { useCreateOrder } from '@/features/checkout/mutations'
import { quoteKeys, quoteQuery } from '@/features/checkout/queries'
import { quoteFingerprint } from '@/features/checkout/quote-fingerprint'
import { isApiError, toApiError } from '@/lib/api-error'
import { cn } from '@/lib/utils'

type Step = 'details' | 'review'

interface CheckoutFlowProps {
  user: User
  wallets: Wallet[]
  pendingOrderId: string | null
}

function sectionTitle(index: number, title: string) {
  return (
    <h2 className="flex items-center gap-3 text-body-xl font-bold">
      <span
        aria-hidden
        className="grid size-7 place-items-center rounded-full bg-primary text-body font-bold text-ink"
      >
        {index}
      </span>
      {title}
    </h2>
  )
}

function useWalletConnection() {
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const connectWallet = useConnectWallet()
  const disconnectWallet = useDisconnectWallet()
  const connect = (walletId: string, network: Network) => {
    setStatus('connecting')
    setError(null)
    connectWallet.mutate(
      { walletId, network },
      {
        onSuccess: () => {
          setStatus('connected')
        },
        onError: (mutationError) => {
          setStatus('rejected')
          setError(toApiError(mutationError).message)
        },
      },
    )
  }
  const disconnect = (walletId: string) => {
    disconnectWallet.mutate(walletId, {
      onSettled: () => {
        setStatus('disconnected')
      },
    })
  }
  const reset = () => {
    setStatus('idle')
    setError(null)
  }
  return { status, error, connect, disconnect, reset }
}

export function CheckoutFlow({ user, wallets, pendingOrderId }: CheckoutFlowProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draft] = useState(readCheckoutDraft)
  const [step, setStep] = useState<Step>('details')
  const [walletId, setWalletId] = useState<string | null>(
    () =>
      draft?.walletId ??
      wallets.find((wallet) => wallet.slot === 'primary')?.id ??
      wallets[0]?.id ??
      null,
  )
  const selectedWallet = wallets.find((wallet) => wallet.id === walletId) ?? null
  const [network, setNetwork] = useState<Network>(
    () => draft?.network ?? selectedWallet?.network ?? 'ethereum',
  )
  const [walletError, setWalletError] = useState<string | undefined>()
  const [acknowledged, setAcknowledged] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<{ message: string; retryable: boolean } | null>(
    null,
  )
  const [lastRequest, setLastRequest] = useState<CreateOrderRequest | null>(null)
  const connection = useWalletConnection()
  const createOrder = useCreateOrder(user.id)

  const form = useForm<Buyer>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      fullName: draft?.fullName ?? user.displayName,
      email: draft?.email ?? user.email,
    },
  })
  const { errors } = form.formState

  const quote = useQuery(quoteQuery(user.id, network, 'checkout'))
  const currentFingerprint = quote.data ? quoteFingerprint(quote.data) : null
  const quoteChanged =
    step === 'review' && acknowledged !== null && currentFingerprint !== acknowledged
  const hasIssues = (quote.data?.issues.length ?? 0) > 0

  useEffect(() => {
    const persist = ({ fullName, email }: Buyer) => {
      saveCheckoutDraft({ fullName, email, walletId, network })
    }
    persist(form.getValues())
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        persist(values)
      },
    })
  }, [form, walletId, network])

  const handleWalletChange = (id: string) => {
    setWalletId(id)
    setWalletError(undefined)
    const wallet = wallets.find((item) => item.id === id)
    if (wallet) setNetwork(wallet.network)
    connection.reset()
  }

  const handleReview = async () => {
    const valid = await form.trigger()
    if (!walletId) {
      setWalletError('Selecione uma carteira cadastrada')
      return
    }
    if (connection.status !== 'connected') {
      setWalletError('Conecte a carteira selecionada para continuar')
      return
    }
    if (!valid || !currentFingerprint) return
    setAcknowledged(currentFingerprint)
    setSubmitError(null)
    setStep('review')
  }

  const handleConfirm = () => {
    const request =
      submitError?.retryable && lastRequest
        ? lastRequest
        : quote.data && walletId
          ? { quoteId: quote.data.id, walletId, network, buyer: form.getValues() }
          : null
    if (!request) return
    setLastRequest(request)
    setSubmitError(null)
    createOrder.mutate(request, {
      onSuccess: (order) => {
        clearCheckoutDraft()
        void navigate({
          to: '/orders/$orderId',
          params: { orderId: order.id },
          replace: true,
          resetScroll: true,
        })
      },
      onError: (error) => {
        const apiError = toApiError(error)
        if (apiError.code === 'QUOTE_OUTDATED') {
          const details = apiError.details as { quote?: unknown } | undefined
          const fresh = quoteSchema.safeParse(details?.quote)
          if (fresh.success) {
            queryClient.setQueryData<Quote>(
              quoteKeys.forScope(user.id, network, 'checkout'),
              fresh.data,
            )
          } else {
            void queryClient.invalidateQueries({ queryKey: quoteKeys.all })
          }
          setSubmitError({ message: apiError.message, retryable: false })
          return
        }
        setSubmitError({
          message:
            apiError.code === 'TIMEOUT' || apiError.code === 'NETWORK_ERROR'
              ? 'Não recebemos a confirmação do pedido. Tente novamente: a mesma tentativa será recuperada, sem cobrança duplicada.'
              : apiError.message,
          retryable: isApiError(error) && error.isTransient,
        })
      },
    })
  }

  const isRetry = Boolean(submitError?.retryable && lastRequest)
  const confirmDisabled =
    createOrder.isPending ||
    (pendingOrderId !== null && !isRetry) ||
    (!isRetry &&
      (quoteChanged ||
        hasIssues ||
        quote.isFetching ||
        !quote.data ||
        connection.status !== 'connected'))

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-12">
      <div className="flex min-w-0 flex-col gap-10">
        {pendingOrderId && (
          <div role="status" className="flex flex-col gap-2 rounded-lg border border-amber p-4">
            <p className="font-bold">Você tem um pedido em processamento.</p>
            <p className="text-body text-text-secondary">
              Aguarde a conclusão dele para enviar uma nova compra.
            </p>
            <Link
              to="/orders/$orderId"
              params={{ orderId: pendingOrderId }}
              className="w-fit text-text-accent hover:underline"
            >
              Acompanhar pedido
            </Link>
          </div>
        )}

        {step === 'details' ? (
          <>
            <section aria-labelledby="buyer-title" className="flex flex-col gap-5">
              <div id="buyer-title">{sectionTitle(1, 'Dados do colecionador')}</div>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Nome completo"
                  autoComplete="name"
                  required
                  error={errors.fullName?.message}
                  {...form.register('fullName')}
                />
                <TextField
                  label="E-mail para o recibo"
                  type="email"
                  autoComplete="email"
                  required
                  error={errors.email?.message}
                  {...form.register('email')}
                />
              </div>
            </section>

            <section aria-labelledby="wallet-title" className="flex flex-col gap-5">
              <div id="wallet-title">{sectionTitle(2, 'Carteira e rede')}</div>
              <WalletSelector
                wallets={wallets}
                selectedId={walletId}
                network={network}
                status={connection.status}
                connectionError={connection.error}
                error={walletError}
                onSelect={handleWalletChange}
                onNetworkChange={(next) => {
                  setNetwork(next)
                  connection.reset()
                }}
                onConnect={() => {
                  if (!walletId) return
                  setWalletError(undefined)
                  connection.connect(walletId, network)
                }}
                onDisconnect={() => {
                  if (walletId) connection.disconnect(walletId)
                }}
              />
            </section>
          </>
        ) : (
          <section aria-labelledby="review-title" className="flex flex-col gap-6">
            <div id="review-title">{sectionTitle(3, 'Revise seu pedido')}</div>
            <dl className="grid gap-4 rounded-lg bg-surface-card p-5 md:grid-cols-2">
              <div>
                <dt className="text-caption-sm text-text-secondary">Colecionador</dt>
                <dd className="text-body-md">{form.getValues('fullName')}</dd>
                <dd className="text-body text-text-secondary">{form.getValues('email')}</dd>
              </div>
              <div>
                <dt className="text-caption-sm text-text-secondary">Carteira</dt>
                <dd className="text-body-md">{selectedWallet?.ens || selectedWallet?.label}</dd>
                <dd className="text-body text-text-secondary">Rede {NETWORK_LABELS[network]}</dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="ghost"
              size="inline"
              className="w-fit"
              onClick={() => {
                setStep('details')
              }}
            >
              Editar dados ou carteira
            </Button>
          </section>
        )}
      </div>

      <aside
        aria-label="Resumo do pagamento"
        className="flex flex-col gap-6 rounded-lg bg-surface-card p-6 lg:sticky lg:top-6"
      >
        <h2 className="text-body-xl font-bold">Resumo</h2>
        {quote.isPending ? (
          <div role="status" aria-label="Calculando valores" className="flex flex-col gap-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6" />
          </div>
        ) : quote.isError ? (
          <div role="alert" className="flex flex-col gap-3">
            <p className="text-body text-text-secondary">{toApiError(quote.error).message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void quote.refetch()
              }}
            >
              Recalcular
            </Button>
          </div>
        ) : (
          <div aria-live="polite" aria-busy={quote.isFetching} className="flex flex-col gap-5">
            <OrderLines lines={quote.data.lines} />
            <OrderTotals {...quote.data} />
          </div>
        )}

        {hasIssues && (
          <p role="alert" className="flex gap-2 text-body text-text-coral">
            <AlertTriangleIcon className="size-5 shrink-0" aria-hidden />
            Há itens indisponíveis.{' '}
            <Link to="/cart" className="font-bold underline">
              Ajuste o carrinho
            </Link>
          </p>
        )}

        {quoteChanged && !isRetry && (
          <div role="alert" className="flex flex-col gap-3 rounded-lg border border-amber p-4">
            <p className="flex gap-2 text-body">
              <AlertTriangleIcon className="size-5 shrink-0 text-amber" aria-hidden />
              Preço, disponibilidade ou taxas mudaram desde a revisão. Confira os novos valores
              antes de confirmar.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setAcknowledged(currentFingerprint)
                setSubmitError(null)
              }}
            >
              Aceitar novos valores
            </Button>
          </div>
        )}

        {submitError && (isRetry || !quoteChanged) && (
          <div role="alert" className="flex flex-col gap-3 rounded-lg border border-error p-4">
            <p className="text-body text-error-foreground">{submitError.message}</p>
            {submitError.retryable && (
              <Button size="sm" onClick={handleConfirm} disabled={createOrder.isPending}>
                Tentar novamente
              </Button>
            )}
          </div>
        )}

        {step === 'details' ? (
          <Button
            size="pill"
            variant="cta"
            className="lg:h-10 lg:rounded-xs lg:bg-primary lg:bg-none"
            disabled={quote.isPending || hasIssues}
            onClick={() => {
              void handleReview()
            }}
          >
            Revisar pedido
          </Button>
        ) : (
          <Button
            size="pill"
            variant="cta"
            className={cn('lg:h-10 lg:rounded-xs lg:bg-primary lg:bg-none')}
            disabled={confirmDisabled}
            aria-busy={createOrder.isPending}
            onClick={handleConfirm}
          >
            {createOrder.isPending ? 'Enviando pedido…' : 'Confirmar compra'}
          </Button>
        )}
        <Link
          to="/cart"
          className={cn(buttonVariants({ variant: 'ghost', size: 'inline' }), 'mx-auto')}
        >
          Voltar ao carrinho
        </Link>
      </aside>
    </div>
  )
}
