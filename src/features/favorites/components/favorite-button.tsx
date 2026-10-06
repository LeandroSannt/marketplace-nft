import { useQuery } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { HeartIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/features/auth/hooks'
import { favoritesQuery, useToggleFavorite } from '@/features/favorites/queries'
import { toApiError } from '@/lib/api-error'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  nftId: string
  nftName: string
  className?: string
}

function AuthenticatedFavoriteButton({
  nftId,
  nftName,
  userId,
  className,
}: FavoriteButtonProps & { userId: string }) {
  const { data, isPending } = useQuery(favoritesQuery(userId))
  const toggle = useToggleFavorite(userId)
  const isFavorite = data?.nftIds.includes(nftId) ?? false

  return (
    <Button
      variant="outline"
      aria-pressed={isFavorite}
      disabled={isPending}
      onClick={() => {
        toggle.mutate(
          { nftId, favorite: !isFavorite },
          {
            onSuccess: () => {
              toast.success(
                isFavorite
                  ? `${nftName} saiu dos favoritos.`
                  : `${nftName} foi adicionado aos favoritos.`,
              )
            },
            onError: (error) => {
              toast.error(toApiError(error).message, {
                description: 'Seus favoritos foram restaurados.',
              })
            },
          },
        )
      }}
      className={cn(
        'h-10 w-32.5 gap-2 rounded-md border-primary text-body font-medium text-text-accent',
        className,
      )}
    >
      <HeartIcon className={cn('size-5', isFavorite && 'fill-primary')} aria-hidden />
      {isFavorite ? 'Favorito' : 'Favoritar'}
    </Button>
  )
}

export function FavoriteButton(props: FavoriteButtonProps) {
  const { userId, isAuthenticated } = useCurrentUser()
  const navigate = useNavigate()
  const href = useRouterState({ select: (state) => state.location.href })

  if (isAuthenticated && userId) return <AuthenticatedFavoriteButton {...props} userId={userId} />

  return (
    <Button
      variant="outline"
      onClick={() => {
        toast.info('Entre na sua conta para salvar favoritos.')
        void navigate({ to: '/login', search: { redirect: href } })
      }}
      className={cn(
        'h-10 w-32.5 gap-2 rounded-md border-primary text-body font-medium text-text-accent',
        props.className,
      )}
    >
      <HeartIcon className="size-5" aria-hidden />
      Favoritar
    </Button>
  )
}
