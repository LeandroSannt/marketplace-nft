import { http, HttpResponse } from 'msw'
import { catalogQuerySchema, type CatalogQuery } from '@/contracts/nft'
import { db } from '@/mocks/db'
import { findNft, queryCatalog, summarizeNft, toNftDetail } from '@/mocks/domain/catalog'
import { API, MockHttpError, notFound, route } from '@/mocks/lib/http'
import { getScenario } from '@/mocks/scenarios'

function listParam(params: URLSearchParams, key: string) {
  const value = params.get(key)
  return value ? value.split(',').filter(Boolean) : undefined
}

function readCatalogQuery(url: URL): CatalogQuery {
  const params = url.searchParams
  const page = params.get('page')
  const result = catalogQuerySchema.safeParse({
    q: params.get('q') ?? undefined,
    collections: listParam(params, 'collections'),
    networks: listParam(params, 'networks'),
    minPrice: params.get('minPrice') ?? undefined,
    maxPrice: params.get('maxPrice') ?? undefined,
    tab: params.get('tab') ?? undefined,
    sort: params.get('sort') ?? undefined,
    page: page ? Number(page) : undefined,
  })
  if (!result.success) {
    throw new MockHttpError(422, 'VALIDATION_ERROR', 'Parâmetros de busca inválidos')
  }
  return result.data
}

export const catalogHandlers = [
  http.get(
    `${API}/nfts/featured`,
    route(() => {
      const nfts = db().nfts
      const hero = findNft('emerald-ape-042') ?? nfts[0]
      const spotlight = nfts.find((nft) => nft.artwork === 'violet') ?? nfts[1]
      if (!hero || !spotlight) throw notFound('Nenhum destaque disponível')
      return HttpResponse.json({ hero: summarizeNft(hero), spotlight: summarizeNft(spotlight) })
    }),
  ),

  http.get(
    `${API}/nfts`,
    route(({ request }) => {
      const query = readCatalogQuery(new URL(request.url))
      return HttpResponse.json(queryCatalog(query, getScenario() === 'empty-catalog'))
    }),
  ),

  http.get<{ id: string }>(
    `${API}/nfts/:id`,
    route<{ id: string }>(({ params }) => {
      const nft = findNft(params.id)
      if (!nft) throw notFound('NFT não encontrado')
      return HttpResponse.json(toNftDetail(nft))
    }),
  ),
]
