import { http, HttpResponse } from 'msw'
import { db, persist } from '@/mocks/db'
import { findNft } from '@/mocks/domain/catalog'
import { API, MockHttpError, notFound, requireUser, route } from '@/mocks/lib/http'
import { getScenario } from '@/mocks/scenarios'

function assertFavoritesAvailable() {
  if (getScenario() === 'favorites-failure') {
    throw new MockHttpError(500, 'INTERNAL_ERROR', 'Não foi possível atualizar seus favoritos')
  }
}

export const favoritesHandlers = [
  http.get(
    `${API}/favorites`,
    route(({ request }) => {
      const user = requireUser(request)
      return HttpResponse.json({ nftIds: db().favorites[user.id] ?? [] })
    }),
  ),

  http.put<{ nftId: string }>(
    `${API}/favorites/:nftId`,
    route<{ nftId: string }>(({ request, params }) => {
      const user = requireUser(request)
      assertFavoritesAvailable()
      if (!findNft(params.nftId)) throw notFound('NFT não encontrado')
      const current = db().favorites[user.id] ?? []
      if (!current.includes(params.nftId)) db().favorites[user.id] = [...current, params.nftId]
      persist()
      return HttpResponse.json({ nftIds: db().favorites[user.id] ?? [] })
    }),
  ),

  http.delete<{ nftId: string }>(
    `${API}/favorites/:nftId`,
    route<{ nftId: string }>(({ request, params }) => {
      const user = requireUser(request)
      assertFavoritesAvailable()
      db().favorites[user.id] = (db().favorites[user.id] ?? []).filter((id) => id !== params.nftId)
      persist()
      return HttpResponse.json({ nftIds: db().favorites[user.id] ?? [] })
    }),
  ),
]
