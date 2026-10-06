import { z } from 'zod'
import { ethAmountSchema, networkSchema, paginatedSchema } from '@/contracts/common'

export const artworkSchema = z.enum(['emerald', 'violet', 'onyx', 'amber'])
export type Artwork = z.infer<typeof artworkSchema>

export const collectionSchema = z.enum([
  'digital-art',
  'photography',
  'music',
  '3d-art',
  'collectibles',
  'generative',
  'gaming',
  'memberships',
  'utility',
])
export type Collection = z.infer<typeof collectionSchema>

export const editionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: ethAmountSchema,
  supply: z.number().int().positive(),
  available: z.number().int().nonnegative(),
  maxPerOrder: z.number().int().positive(),
})
export type Edition = z.infer<typeof editionSchema>

export const nftSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  collection: collectionSchema,
  network: networkSchema,
  artwork: artworkSchema,
  creator: z.string(),
  price: ethAmountSchema,
  available: z.number().int().nonnegative(),
  supply: z.number().int().positive(),
  version: z.number().int().nonnegative(),
})
export type NftSummary = z.infer<typeof nftSummarySchema>

export const nftDetailSchema = nftSummarySchema.extend({
  description: z.string(),
  gallery: z.array(artworkSchema).min(1),
  editions: z.array(editionSchema).min(1),
  rating: z.number().min(0).max(5),
  reviewsCount: z.number().int().nonnegative(),
  contractAddress: z.string(),
  royaltiesPercent: z.number().min(0).max(100),
  listedAt: z.iso.datetime(),
})
export type NftDetail = z.infer<typeof nftDetailSchema>

export const catalogTabSchema = z.enum(['all', 'new', 'trending'])
export type CatalogTab = z.infer<typeof catalogTabSchema>

export const catalogSortSchema = z.enum(['recent', 'price-asc', 'price-desc', 'name'])
export type CatalogSort = z.infer<typeof catalogSortSchema>

export const CATALOG_PAGE_SIZE = 9

export const catalogQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  collections: z.array(collectionSchema).optional(),
  networks: z.array(networkSchema).optional(),
  minPrice: ethAmountSchema.optional(),
  maxPrice: ethAmountSchema.optional(),
  tab: catalogTabSchema.optional(),
  sort: catalogSortSchema.optional(),
  page: z.number().int().positive().optional(),
})
export type CatalogQuery = z.infer<typeof catalogQuerySchema>

export const facetSchema = z.object({ id: z.string(), count: z.number().int().nonnegative() })

export const catalogResponseSchema = paginatedSchema(nftSummarySchema).extend({
  facets: z.object({
    collections: z.array(facetSchema.extend({ id: collectionSchema })),
    networks: z.array(facetSchema.extend({ id: networkSchema })),
    priceRange: z.object({ min: ethAmountSchema, max: ethAmountSchema }),
  }),
})
export type CatalogResponse = z.infer<typeof catalogResponseSchema>

export const featuredResponseSchema = z.object({
  hero: nftSummarySchema,
  spotlight: nftSummarySchema,
})
export type FeaturedResponse = z.infer<typeof featuredResponseSchema>
