import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { HomeBackdrop } from '@/features/catalog/components/home-backdrop'
import { LoginForm } from '@/features/auth/components/login-form'
import { authSearchSchema } from '@/features/auth/search'
import { useAuthRedirect } from '@/features/auth/use-auth-redirect'
import { sessionStore } from '@/lib/session-store'

export const Route = createFileRoute('/login')({
  validateSearch: authSearchSchema,
  beforeLoad: ({ search }) => {
    if (sessionStore.get().token) throw redirect({ href: search.redirect ?? '/' })
  },
  head: () => ({ meta: [{ title: 'Entrar — Kurio' }] }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect: target } = Route.useSearch()
  const { onSuccess, onClose } = useAuthRedirect(target)

  return (
    <AuthLayout
      title="Entrar"
      description="Acesse sua conta para comprar, favoritar e acompanhar seus pedidos."
      onClose={onClose}
      backdrop={<HomeBackdrop />}
    >
      <LoginForm redirect={target} onSuccess={onSuccess} />
    </AuthLayout>
  )
}
