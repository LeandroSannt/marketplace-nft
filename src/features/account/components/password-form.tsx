import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { PasswordField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { changePasswordRequestSchema, type ChangePasswordRequest } from '@/contracts/profile'
import { useChangePassword } from '@/features/account/queries'
import { applyApiErrors } from '@/lib/form-errors'

const EMPTY: ChangePasswordRequest = { currentPassword: '', newPassword: '', confirmPassword: '' }

export function PasswordForm() {
  const change = useChangePassword()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordRequestSchema),
    defaultValues: EMPTY,
  })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    change.mutate(values, {
      onSuccess: () => {
        form.reset(EMPTY)
        toast.success('Senha alterada.')
      },
      onError: (error) => {
        setFormError(
          applyApiErrors(error, form.setError, [
            'currentPassword',
            'newPassword',
            'confirmPassword',
          ]),
        )
      },
    })
  })

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      aria-labelledby="password-form-title"
      className="flex flex-col gap-6"
    >
      <h2 id="password-form-title" className="text-section font-bold">
        Alterar senha
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
        <PasswordField
          label="Senha atual"
          required
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...form.register('currentPassword')}
        />
        <div className="hidden md:block" />
        <PasswordField
          label="Nova senha"
          required
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...form.register('newPassword')}
        />
        <PasswordField
          label="Confirmar nova senha"
          required
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />
      </div>
      <Button
        type="submit"
        size="form"
        disabled={change.isPending}
        aria-busy={change.isPending}
        className="w-fit"
      >
        {change.isPending ? 'Alterando…' : 'Alterar senha'}
      </Button>
    </form>
  )
}
