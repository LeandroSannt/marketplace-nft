import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PasswordForm } from '@/features/account/components/password-form'
import { ProfileForm } from '@/features/account/components/profile-form'
import { profileQuery } from '@/features/account/queries'
import { toApiError } from '@/lib/api-error'
import { useSession } from '@/lib/session-store'

export const Route = createFileRoute('/account/profile')({
  head: () => ({ meta: [{ title: 'Perfil do colecionador — Kurio' }] }),
  component: ProfilePage,
})

function ProfilePage() {
  const { userId } = useSession()
  const profile = useQuery({ ...profileQuery(userId ?? ''), enabled: Boolean(userId) })

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-title font-bold">Detalhes do perfil</h1>
      {profile.isPending && (
        <div role="status" aria-label="Carregando perfil" className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-[65px]" />
          ))}
        </div>
      )}
      {profile.isError && (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p className="text-body text-text-secondary">{toApiError(profile.error).message}</p>
          <Button
            onClick={() => {
              void profile.refetch()
            }}
          >
            Tentar novamente
          </Button>
        </div>
      )}
      {profile.data && (
        <>
          <ProfileForm key={profile.data.id} user={profile.data} />
          <hr className="border-border" />
          <PasswordForm />
        </>
      )}
    </div>
  )
}
