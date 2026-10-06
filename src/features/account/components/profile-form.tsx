import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { TextareaField, TextField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import type { User } from '@/contracts/auth'
import { updateProfileRequestSchema, type UpdateProfileRequest } from '@/contracts/profile'
import { AvatarField } from '@/features/account/components/avatar-field'
import { useUpdateProfile } from '@/features/account/queries'
import { applyApiErrors } from '@/lib/form-errors'

const PROFILE_FIELDS = ['displayName', 'username', 'bio', 'website', 'ens', 'avatarUrl'] as const

export function ProfileForm({ user }: { user: User }) {
  const update = useUpdateProfile(user.id)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileRequestSchema),
    defaultValues: {
      displayName: user.displayName,
      username: user.username,
      bio: user.bio,
      website: user.website,
      ens: user.ens,
      avatarUrl: user.avatarUrl,
    },
  })
  const { errors, isDirty } = form.formState

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    update.mutate(values, {
      onSuccess: (saved) => {
        form.reset({
          displayName: saved.displayName,
          username: saved.username,
          bio: saved.bio,
          website: saved.website,
          ens: saved.ens,
          avatarUrl: saved.avatarUrl,
        })
        toast.success('Perfil atualizado.')
      },
      onError: (error) => {
        setFormError(applyApiErrors(error, form.setError, PROFILE_FIELDS))
      },
    })
  })

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      aria-labelledby="profile-form-title"
      className="flex flex-col gap-6"
    >
      <h2 id="profile-form-title" className="text-section font-bold">
        Perfil do colecionador
      </h2>
      {formError && (
        <p
          role="alert"
          className="rounded-sm border border-error px-4 py-3 text-body text-error-foreground"
        >
          {formError}
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-2 md:gap-x-7">
        <TextField
          label="Nome de exibição"
          required
          autoComplete="nickname"
          error={errors.displayName?.message}
          {...form.register('displayName')}
        />
        <TextField
          label="Nome de usuário"
          required
          autoComplete="username"
          error={errors.username?.message}
          {...form.register('username')}
        />
        <TextareaField label="Bio" rows={3} error={errors.bio?.message} {...form.register('bio')} />
        <TextField
          label="Site"
          type="url"
          placeholder="https://"
          autoComplete="url"
          error={errors.website?.message}
          {...form.register('website')}
        />
        <TextField
          label="Nome ENS"
          placeholder="seunome.eth"
          error={errors.ens?.message}
          {...form.register('ens')}
        />
        <Controller
          control={form.control}
          name="avatarUrl"
          render={({ field, fieldState }) => (
            <AvatarField
              value={field.value}
              onChange={(value) => {
                field.onChange(value)
              }}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>
      <Button
        type="submit"
        size="form"
        disabled={update.isPending || !isDirty}
        aria-busy={update.isPending}
        className="w-fit"
      >
        {update.isPending ? 'Salvando…' : 'Salvar'}
      </Button>
    </form>
  )
}
