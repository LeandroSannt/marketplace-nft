import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { HomeBackdrop } from '@/features/catalog/components/home-backdrop'
import { RegisterForm } from '@/features/auth/components/register-form'
import { authSearchSchema } from '@/features/auth/search'
import { useAuthRedirect } from '@/features/auth/use-auth-redirect'
import { sessionStore } from '@/lib/session-store'

export const Route = createFileRoute('/register')({
  validateSearch: authSearchSchema,
  beforeLoad: ({ search }) => {
    if (sessionStore.get().token) throw redirect({ href: search.redirect ?? '/' })
  },
  head: () => ({ meta: [{ title: 'Criar conta — Kurio' }] }),
  component: RegisterPage,
})

function RegisterPage() {
  const { redirect: target } = Route.useSearch()
  const { onSuccess, onClose } = useAuthRedirect(target)

  return (
    <AuthLayout
      title="Criar perfil de colecionador"
      description="Crie seu perfil e conecte suas carteiras para colecionar arte digital."
      onClose={onClose}
      backdrop={<HomeBackdrop />}
    >
      <RegisterForm redirect={target} onSuccess={onSuccess} />
    </AuthLayout>
  )
}
