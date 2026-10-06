import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PasswordField, TextField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { registerRequestSchema, type Session } from '@/contracts/auth'
import { SocialAuth } from '@/features/auth/components/social-auth'
import { useRegister } from '@/features/auth/queries'
import { applyApiErrors } from '@/lib/form-errors'
import { DESKTOP_QUERY, useMediaQuery } from '@/lib/use-media-query'

const registerFormSchema = registerRequestSchema
  .extend({ confirmPassword: z.string().min(1, 'Confirme sua senha') })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerFormSchema>

interface RegisterFormProps {
  redirect?: string
  onSuccess: (session: Session) => void
}

export function RegisterForm({ redirect, onSuccess }: RegisterFormProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const register = useRegister()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  })
  const { errors } = form.formState
  const inputSize = isDesktop ? 'default' : 'auth'

  const onSubmit = form.handleSubmit(({ confirmPassword: _confirm, ...values }) => {
    setFormError(null)
    register.mutate(values, {
      onSuccess,
      onError: (error) => {
        setFormError(applyApiErrors(error, form.setError, ['username', 'email', 'password']))
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
          label="Nome de usuário"
          hideLabel
          autoComplete="username"
          placeholder="Nome de usuário"
          size={inputSize}
          required
          error={errors.username?.message}
          {...form.register('username')}
        />
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
          autoComplete="new-password"
          placeholder="Senha"
          size={inputSize}
          required
          error={errors.password?.message}
          {...form.register('password')}
        />
        <PasswordField
          label="Confirmar senha"
          hideLabel
          autoComplete="new-password"
          placeholder="Confirmar senha"
          size={inputSize}
          required
          error={errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />
        <Button
          type="submit"
          size={isDesktop ? 'modal' : 'auth'}
          disabled={register.isPending}
          aria-busy={register.isPending}
          className="mt-5"
        >
          {register.isPending ? 'Criando perfil…' : 'Criar perfil'}
        </Button>
      </form>
      <SocialAuth />
      <p className="text-center text-body-md text-text-secondary">
        Já tem uma conta?{' '}
        <Link
          to="/login"
          search={{ redirect }}
          className="font-bold text-text-accent hover:underline"
        >
          Entre
        </Link>
      </p>
    </div>
  )
}
