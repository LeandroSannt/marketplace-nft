import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { CatalogQuery } from '@/contracts/nft'
import { catalogApi } from '@/features/catalog/api'

export const catalogKeys = {
  all: ['catalog'] as const,
  lists: () => [...catalogKeys.all, 'list'] as const,
  list: (query: CatalogQuery) => [...catalogKeys.lists(), query] as const,
  featured: () => [...catalogKeys.all, 'featured'] as const,
  details: () => [...catalogKeys.all, 'detail'] as const,
  detail: (id: string) => [...catalogKeys.details(), id] as const,
}

export const catalogListQuery = (query: CatalogQuery) =>
  queryOptions({
    queryKey: catalogKeys.list(query),
    queryFn: ({ signal }) => catalogApi.list(query, signal),
    placeholderData: keepPreviousData,
  })

export const featuredQuery = () =>
  queryOptions({
    queryKey: catalogKeys.featured(),
    queryFn: ({ signal }) => catalogApi.featured(signal),
    staleTime: 5 * 60_000,
  })

export const nftDetailQuery = (id: string) =>
  queryOptions({
    queryKey: catalogKeys.detail(id),
    queryFn: ({ signal }) => catalogApi.detail(id, signal),
  })
