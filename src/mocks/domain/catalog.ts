import {
  CATALOG_PAGE_SIZE,
  type CatalogQuery,
  type CatalogResponse,
  type Collection,
  type NftDetail,
  type NftSummary,
} from '@/contracts/nft'
import type { Network } from '@/contracts/common'
import { compareEth } from '@/lib/money'
import { db } from '@/mocks/db'
import type { NftRecord } from '@/mocks/fixtures/nfts'

const NEW_WINDOW_MS = 3 * 24 * 3600_000
const TRENDING_THRESHOLD = 60

function lowestPrice(nft: NftRecord) {
  const prices = nft.editions.map((edition) => edition.price)
  return prices.reduce((lowest, price) => (compareEth(price, lowest) < 0 ? price : lowest))
}

export function summarizeNft(nft: NftRecord): NftSummary {
  return {
    id: nft.id,
    name: nft.name,
    collection: nft.collection,
    network: nft.network,
    artwork: nft.artwork,
    creator: nft.creator,
    price: lowestPrice(nft),
    available: nft.editions.reduce((sum, edition) => sum + edition.available, 0),
    supply: nft.editions.reduce((sum, edition) => sum + edition.supply, 0),
    version: nft.version,
  }
}

export function toNftDetail(nft: NftRecord): NftDetail {
  return {
    ...summarizeNft(nft),
    description: nft.description,
    gallery: nft.gallery,
    editions: nft.editions,
    rating: nft.rating,
    reviewsCount: nft.reviewsCount,
    contractAddress: nft.contractAddress,
    royaltiesPercent: nft.royaltiesPercent,
    listedAt: nft.listedAt,
  }
}

export function findNft(id: string) {
  return db().nfts.find((nft) => nft.id === id)
}

function newestListing() {
  return Math.max(...db().nfts.map((nft) => new Date(nft.listedAt).getTime()))
}

function matchesTab(nft: NftRecord, tab: CatalogQuery['tab'], newest: number) {
  if (tab === 'new') return newest - new Date(nft.listedAt).getTime() <= NEW_WINDOW_MS
  if (tab === 'trending') return nft.trendingScore >= TRENDING_THRESHOLD
  return true
}

function matchesSearch(nft: NftRecord, q: string | undefined) {
  if (!q) return true
  const term = q.toLowerCase()
  return nft.name.toLowerCase().includes(term) || nft.creator.toLowerCase().includes(term)
}

function matchesPrice(price: string, query: CatalogQuery) {
  if (query.minPrice && compareEth(price, query.minPrice) < 0) return false
  if (query.maxPrice && compareEth(price, query.maxPrice) > 0) return false
  return true
}

function sortSummaries(
  items: NftSummary[],
  records: Map<string, NftRecord>,
  sort: CatalogQuery['sort'],
) {
  const listedAt = (item: NftSummary) => new Date(records.get(item.id)?.listedAt ?? 0).getTime()
  const sorted = [...items]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => compareEth(a.price, b.price) || a.name.localeCompare(b.name))
    case 'price-desc':
      return sorted.sort((a, b) => compareEth(b.price, a.price) || a.name.localeCompare(b.name))
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return sorted.sort((a, b) => listedAt(b) - listedAt(a) || a.name.localeCompare(b.name))
  }
}

function countBy<T extends string>(
  items: NftRecord[],
  key: (nft: NftRecord) => T,
  ids: readonly T[],
) {
  return ids.map((id) => ({ id, count: items.filter((nft) => key(nft) === id).length }))
}

const COLLECTION_IDS: readonly Collection[] = [
  'digital-art',
  'photography',
  'music',
  '3d-art',
  'collectibles',
  'generative',
  'gaming',
  'memberships',
  'utility',
]
const NETWORK_IDS: readonly Network[] = ['ethereum', 'polygon', 'solana']

export function queryCatalog(query: CatalogQuery, isEmpty: boolean): CatalogResponse {
  const nfts = isEmpty ? [] : db().nfts
  const newest = nfts.length ? newestListing() : 0
  const base = nfts.filter(
    (nft) => matchesTab(nft, query.tab, newest) && matchesSearch(nft, query.q),
  )

  const filtered = base.filter((nft) => {
    const summary = summarizeNft(nft)
    if (query.collections?.length && !query.collections.includes(nft.collection)) return false
    if (query.networks?.length && !query.networks.includes(nft.network)) return false
    return matchesPrice(summary.price, query)
  })

  const records = new Map(nfts.map((nft) => [nft.id, nft]))
  const sorted = sortSummaries(filtered.map(summarizeNft), records, query.sort)
  const page = query.page ?? 1
  const totalPages = Math.ceil(sorted.length / CATALOG_PAGE_SIZE)
  const prices = base.map(lowestPrice)

  return {
    items: sorted.slice((page - 1) * CATALOG_PAGE_SIZE, page * CATALOG_PAGE_SIZE),
    page,
    pageSize: CATALOG_PAGE_SIZE,
    total: sorted.length,
    totalPages,
    facets: {
      collections: countBy(base, (nft) => nft.collection, COLLECTION_IDS),
      networks: countBy(base, (nft) => nft.network, NETWORK_IDS),
      priceRange: {
        min: prices.length ? prices.reduce((a, b) => (compareEth(a, b) <= 0 ? a : b)) : '0',
        max: prices.length ? prices.reduce((a, b) => (compareEth(a, b) >= 0 ? a : b)) : '0',
      },
    },
  }
}
