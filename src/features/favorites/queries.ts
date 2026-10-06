import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Favorites } from '@/contracts/favorites'
import { favoritesApi } from '@/features/favorites/api'

export const favoritesKeys = {
  all: ['favorites'] as const,
  forUser: (userId: string) => [...favoritesKeys.all, userId] as const,
}

export const favoritesQuery = (userId: string) =>
  queryOptions({
    queryKey: favoritesKeys.forUser(userId),
    queryFn: ({ signal }) => favoritesApi.list(signal),
  })

interface ToggleFavoriteInput {
  nftId: string
  favorite: boolean
}

export function useToggleFavorite(userId: string) {
  const queryClient = useQueryClient()
  const queryKey = favoritesKeys.forUser(userId)

  return useMutation({
    mutationKey: [...queryKey, 'toggle'],
    mutationFn: ({ nftId, favorite }: ToggleFavoriteInput) =>
      favorite ? favoritesApi.add(nftId) : favoritesApi.remove(nftId),
    onMutate: async ({ nftId, favorite }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Favorites>(queryKey)
      queryClient.setQueryData<Favorites>(queryKey, (current) => {
        const ids = (current?.nftIds ?? []).filter((id) => id !== nftId)
        return { nftIds: favorite ? [...ids, nftId] : ids }
      })
      return { previous }
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSuccess: (favorites) => {
      queryClient.setQueryData(queryKey, favorites)
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: [...queryKey, 'toggle'] }) === 1) {
        void queryClient.invalidateQueries({ queryKey })
      }
    },
  })
}
