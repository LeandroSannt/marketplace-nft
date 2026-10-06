import {
  catalogResponseSchema,
  featuredResponseSchema,
  nftDetailSchema,
  type CatalogQuery,
} from '@/contracts/nft'
import { apiRequest } from '@/lib/http'

function toSearchParams(query: CatalogQuery) {
  return {
    q: query.q || undefined,
    collections: query.collections?.length ? query.collections.join(',') : undefined,
    networks: query.networks?.length ? query.networks.join(',') : undefined,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    tab: query.tab,
    sort: query.sort,
    page: query.page,
  }
}

export const catalogApi = {
  list: (query: CatalogQuery, signal?: AbortSignal) =>
    apiRequest(catalogResponseSchema, {
      method: 'GET',
      url: '/nfts',
      params: toSearchParams(query),
      signal,
    }),
  featured: (signal?: AbortSignal) =>
    apiRequest(featuredResponseSchema, { method: 'GET', url: '/nfts/featured', signal }),
  detail: (id: string, signal?: AbortSignal) =>
    apiRequest(nftDetailSchema, { method: 'GET', url: `/nfts/${encodeURIComponent(id)}`, signal }),
}
