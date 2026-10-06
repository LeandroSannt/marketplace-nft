import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { Session } from '@/contracts/auth'

export function useAuthRedirect(redirect: string | undefined) {
  const navigate = useNavigate()
  const target = redirect ?? '/'

  return {
    onSuccess: (session: Session) => {
      toast.success(`Bem-vindo, ${session.user.displayName}!`)
      void navigate({ href: target, replace: true })
    },
    onClose: () => {
      void navigate({ href: redirect && !redirect.startsWith('/checkout') ? redirect : '/' })
    },
  }
}
