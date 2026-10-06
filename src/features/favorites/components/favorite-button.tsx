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
  compact?: boolean
  className?: string
}

interface FavoriteToggleProps {
  isFavorite: boolean
  compact: boolean
  disabled?: boolean
  pressed?: boolean
  className?: string
  onClick: () => void
}

function FavoriteToggle({
  isFavorite,
  compact,
  disabled,
  pressed,
  className,
  onClick,
}: FavoriteToggleProps) {
  const label = isFavorite ? 'Favorito' : 'Favoritar'
  const icon = <HeartIcon className={cn('size-5', isFavorite && 'fill-primary')} aria-hidden />

  if (compact) {
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'grid size-11 cursor-pointer place-items-center rounded-full bg-surface-card text-primary disabled:opacity-50',
          className,
        )}
      >
        {icon}
      </button>
    )
  }

  return (
    <Button
      variant="outline"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'h-10 w-32.5 gap-2 rounded-md border-primary text-body font-medium text-text-accent',
        className,
      )}
    >
      {icon}
      {label}
    </Button>
  )
}

function AuthenticatedFavoriteButton({
  nftId,
  nftName,
  userId,
  compact = false,
  className,
}: FavoriteButtonProps & { userId: string }) {
  const { data, isPending } = useQuery(favoritesQuery(userId))
  const toggle = useToggleFavorite(userId)
  const isFavorite = data?.nftIds.includes(nftId) ?? false

  return (
    <FavoriteToggle
      isFavorite={isFavorite}
      compact={compact}
      pressed={isFavorite}
      disabled={isPending}
      className={className}
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
    />
  )
}

export function FavoriteButton(props: FavoriteButtonProps) {
  const { userId, isAuthenticated } = useCurrentUser()
  const navigate = useNavigate()
  const href = useRouterState({ select: (state) => state.location.href })

  if (isAuthenticated && userId) return <AuthenticatedFavoriteButton {...props} userId={userId} />

  return (
    <FavoriteToggle
      isFavorite={false}
      compact={props.compact ?? false}
      className={props.className}
      onClick={() => {
        toast.info('Entre na sua conta para salvar favoritos.')
        void navigate({ to: '/login', search: { redirect: href } })
      }}
    />
  )
}
