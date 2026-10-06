import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { TextField } from '@/components/form-field'
import { SelectField } from '@/components/select-field'
import { Button } from '@/components/ui/button'
import { networkSchema } from '@/contracts/common'
import {
  upsertWalletRequestSchema,
  walletProviderSchema,
  type UpsertWalletRequest,
  type Wallet,
  type WalletProvider,
  type WalletSlot,
} from '@/contracts/wallet'
import { useSaveWallet } from '@/features/account/queries'
import { NETWORK_LABELS } from '@/lib/labels'
import { applyApiErrors } from '@/lib/form-errors'

const PROVIDER_LABELS: Record<WalletProvider, string> = {
  metamask: 'MetaMask',
  walletconnect: 'WalletConnect',
  coinbase: 'Coinbase Wallet',
  phantom: 'Phantom',
}

const PROVIDER_OPTIONS = walletProviderSchema.options.map((value) => ({
  value,
  label: PROVIDER_LABELS[value],
}))

const NETWORK_OPTIONS = networkSchema.options.map((value) => ({
  value,
  label: NETWORK_LABELS[value],
}))

const SLOT_TITLES: Record<WalletSlot, string> = {
  primary: 'Carteira principal',
  secondary: 'Carteira secundária',
}

const WALLET_FIELDS = ['slot', 'provider', 'label', 'address', 'network', 'ens'] as const

interface WalletFormProps {
  userId: string
  slot: WalletSlot
  wallet: Wallet | undefined
}

function toFormValues(slot: WalletSlot, wallet: Wallet | undefined): Partial<UpsertWalletRequest> {
  return {
    slot,
    provider: wallet?.provider,
    label: wallet?.label ?? '',
    address: wallet?.address ?? '',
    network: wallet?.network,
    ens: wallet?.ens ?? '',
  }
}

export function WalletForm({ userId, slot, wallet }: WalletFormProps) {
  const save = useSaveWallet(userId)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<UpsertWalletRequest>({
    resolver: zodResolver(upsertWalletRequestSchema),
    defaultValues: toFormValues(slot, wallet),
  })
  const { errors, isDirty } = form.formState
  const titleId = `wallet-${slot}-title`

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    save.mutate(
      { id: wallet?.id, body: values },
      {
        onSuccess: (saved) => {
          form.reset(toFormValues(slot, saved))
          toast.success(`${SLOT_TITLES[slot]} ${wallet ? 'atualizada' : 'cadastrada'}.`)
        },
        onError: (error) => {
          setFormError(applyApiErrors(error, form.setError, WALLET_FIELDS))
        },
      },
    )
  })

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      aria-labelledby={titleId}
      className="flex flex-col gap-6 rounded-lg bg-surface-card p-6"
    >
      <div className="flex flex-col gap-2">
        <h2 id={titleId} className="text-section font-bold">
          {SLOT_TITLES[slot]}
        </h2>
        {!wallet && (
          <p className="text-body text-text-secondary">Nenhuma carteira cadastrada neste espaço.</p>
        )}
      </div>
      {formError && (
        <p
          role="alert"
          className="rounded-sm border border-error px-4 py-3 text-body text-error-foreground"
        >
          {formError}
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-2 md:gap-x-7">
        <Controller
          control={form.control}
          name="provider"
          render={({ field, fieldState }) => (
            <SelectField
              label="Carteira"
              required
              placeholder="Selecione a carteira"
              value={field.value}
              options={PROVIDER_OPTIONS}
              onChange={field.onChange}
              error={fieldState.error ? 'Selecione a carteira' : undefined}
            />
          )}
        />
        <Controller
          control={form.control}
          name="network"
          render={({ field, fieldState }) => (
            <SelectField
              label="Rede"
              required
              placeholder="Selecione uma rede"
              value={field.value}
              options={NETWORK_OPTIONS}
              onChange={field.onChange}
              error={fieldState.error ? 'Selecione uma rede' : undefined}
            />
          )}
        />
        <TextField
          label="Apelido da carteira"
          required
          error={errors.label?.message}
          {...form.register('label')}
        />
        <TextField
          label="Endereço da carteira"
          required
          placeholder="Endereço 0x da carteira"
          autoComplete="off"
          spellCheck={false}
          error={errors.address?.message}
          {...form.register('address')}
        />
        <TextField
          label="Nome ENS"
          placeholder="seunome.eth"
          error={errors.ens?.message}
          {...form.register('ens')}
        />
      </div>
      <Button
        type="submit"
        size="form"
        disabled={save.isPending || (Boolean(wallet) && !isDirty)}
        aria-busy={save.isPending}
        className="w-fit"
      >
        {save.isPending ? 'Salvando…' : wallet ? 'Salvar' : 'Adicionar'}
      </Button>
    </form>
  )
}
