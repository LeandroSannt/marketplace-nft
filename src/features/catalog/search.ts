import { z } from 'zod'
import { ethAmountSchema, networkSchema } from '@/contracts/common'
import {
  catalogSortSchema,
  catalogTabSchema,
  collectionSchema,
  type CatalogQuery,
} from '@/contracts/nft'

const listOf = <T extends z.ZodType>(item: T) =>
  z
    .union([z.array(item), item])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .optional()
    .catch(undefined)

export const catalogSearchSchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  collections: listOf(collectionSchema),
  networks: listOf(networkSchema),
  minPrice: ethAmountSchema.optional().catch(undefined),
  maxPrice: ethAmountSchema.optional().catch(undefined),
  tab: catalogTabSchema.optional().catch(undefined),
  sort: catalogSortSchema.optional().catch(undefined),
  page: z.coerce.number().int().positive().optional().catch(undefined),
})

export type CatalogSearch = z.infer<typeof catalogSearchSchema>

export function toCatalogQuery(search: CatalogSearch): CatalogQuery {
  return {
    q: search.q || undefined,
    collections: search.collections?.length ? [...search.collections].sort() : undefined,
    networks: search.networks?.length ? [...search.networks].sort() : undefined,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    tab: search.tab ?? 'all',
    sort: search.sort ?? 'recent',
    page: search.page ?? 1,
  }
}

export function hasActiveFilters(search: CatalogSearch) {
  return Boolean(
    search.q ||
    search.collections?.length ||
    search.networks?.length ||
    search.minPrice ||
    search.maxPrice,
  )
}
