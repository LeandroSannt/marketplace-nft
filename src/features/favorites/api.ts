import { favoritesSchema } from '@/contracts/favorites'
import { apiRequest } from '@/lib/http'

export const favoritesApi = {
  list: (signal?: AbortSignal) =>
    apiRequest(favoritesSchema, { method: 'GET', url: '/favorites', signal }),
  add: (nftId: string) =>
    apiRequest(favoritesSchema, { method: 'PUT', url: `/favorites/${encodeURIComponent(nftId)}` }),
  remove: (nftId: string) =>
    apiRequest(favoritesSchema, {
      method: 'DELETE',
      url: `/favorites/${encodeURIComponent(nftId)}`,
    }),
}
