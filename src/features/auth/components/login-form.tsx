import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PasswordField, TextField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { loginRequestSchema, type LoginRequest, type Session } from '@/contracts/auth'
import { SocialAuth } from '@/features/auth/components/social-auth'
import { useLogin } from '@/features/auth/queries'
import { announceComingSoon } from '@/lib/coming-soon'
import { applyApiErrors } from '@/lib/form-errors'
import { DESKTOP_QUERY, useMediaQuery } from '@/lib/use-media-query'

interface LoginFormProps {
  redirect?: string
  onSuccess: (session: Session) => void
}

export function LoginForm({ redirect, onSuccess }: LoginFormProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const login = useLogin()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '' },
  })
  const { errors } = form.formState
  const inputSize = isDesktop ? 'default' : 'auth'

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    login.mutate(values, {
      onSuccess,
      onError: (error) => {
        setFormError(applyApiErrors(error, form.setError, ['email', 'password']))
      },
    })
  })

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={(event) => void onSubmit(event)} noValidate className="flex flex-col gap-3">
        {formError && (
          <p
            role="alert"
            className="rounded-sm border border-error px-4 py-3 text-body text-error-foreground"
          >
            {formError}
          </p>
        )}
        <TextField
          label="E-mail"
          hideLabel
          type="email"
          autoComplete="email"
          placeholder="Digite seu e-mail"
          size={inputSize}
          required
          error={errors.email?.message}
          {...form.register('email')}
        />
        <PasswordField
          label="Senha"
          hideLabel
          autoComplete="current-password"
          placeholder="Senha"
          size={inputSize}
          required
          error={errors.password?.message}
          {...form.register('password')}
        />
        <button
          type="button"
          onClick={() => {
            announceComingSoon('A recuperação de senha')
          }}
          className="ml-auto cursor-pointer text-body text-text-accent hover:underline"
        >
          Esqueceu a senha?
        </button>
        <Button
          type="submit"
          size={isDesktop ? 'modal' : 'auth'}
          disabled={login.isPending}
          aria-busy={login.isPending}
          className="mt-5"
        >
          {login.isPending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
      <SocialAuth />
      <p className="text-center text-body-md text-text-secondary">
        Novo na Kurio?{' '}
        <Link
          to="/register"
          search={{ redirect }}
          className="font-bold text-text-accent hover:underline"
        >
          Crie uma conta
        </Link>
      </p>
    </div>
  )
}
