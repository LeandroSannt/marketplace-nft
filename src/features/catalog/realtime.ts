import type { QueryClient } from '@tanstack/react-query'
import type { NftUpdatedEvent } from '@/contracts/events'
import type { CatalogResponse, FeaturedResponse, NftDetail, NftSummary } from '@/contracts/nft'
import { catalogKeys } from '@/features/catalog/queries'

function patchSummary<T extends NftSummary>(item: T, event: NftUpdatedEvent): T {
  if (item.id !== event.resource.id || item.version >= event.version) return item
  return {
    ...item,
    price: event.data.price,
    available: event.data.available,
    version: event.version,
  }
}

function patchDetail(detail: NftDetail, event: NftUpdatedEvent): NftDetail {
  if (detail.version >= event.version) return detail
  return {
    ...patchSummary(detail, event),
    editions: detail.editions.map((edition) => {
      const update = event.data.editions.find((item) => item.id === edition.id)
      return update ? { ...edition, price: update.price, available: update.available } : edition
    }),
  }
}

export function applyNftUpdated(queryClient: QueryClient, event: NftUpdatedEvent) {
  queryClient.setQueryData<NftDetail>(catalogKeys.detail(event.resource.id), (detail) =>
    detail ? patchDetail(detail, event) : detail,
  )

  queryClient.setQueriesData<CatalogResponse>({ queryKey: catalogKeys.lists() }, (list) =>
    list ? { ...list, items: list.items.map((item) => patchSummary(item, event)) } : list,
  )

  queryClient.setQueryData<FeaturedResponse>(catalogKeys.featured(), (featured) =>
    featured
      ? {
          hero: patchSummary(featured.hero, event),
          spotlight: patchSummary(featured.spotlight, event),
        }
      : featured,
  )

  void queryClient.invalidateQueries({ queryKey: catalogKeys.lists(), refetchType: 'none' })
}
