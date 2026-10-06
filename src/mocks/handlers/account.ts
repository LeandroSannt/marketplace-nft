import { http, HttpResponse } from 'msw'
import { changePasswordRequestSchema, updateProfileRequestSchema } from '@/contracts/profile'
import {
  connectWalletRequestSchema,
  upsertWalletRequestSchema,
  type Wallet,
} from '@/contracts/wallet'
import { db, persist, toPublicUser } from '@/mocks/db'
import { hashPassword } from '@/mocks/lib/crypto'
import {
  API,
  forbidden,
  MockHttpError,
  notFound,
  parseBody,
  requireUser,
  route,
} from '@/mocks/lib/http'
import { createId } from '@/mocks/lib/random'
import { getScenario } from '@/mocks/scenarios'

function walletsOf(userId: string) {
  const wallets = db().wallets[userId] ?? []
  db().wallets[userId] = wallets
  return wallets
}

function findWallet(userId: string, walletId: string): Wallet {
  const wallet = walletsOf(userId).find((item) => item.id === walletId)
  if (wallet) return wallet
  const ownedByOther = Object.values(db().wallets).some((list) =>
    list.some((item) => item.id === walletId),
  )
  if (ownedByOther) throw forbidden('Esta carteira pertence a outra conta')
  throw notFound('Carteira não encontrada')
}

export const accountHandlers = [
  http.get(
    `${API}/profile`,
    route(({ request }) => HttpResponse.json(toPublicUser(requireUser(request)))),
  ),

  http.patch(
    `${API}/profile`,
    route(async ({ request }) => {
      const user = requireUser(request)
      const body = await parseBody(request, updateProfileRequestSchema)
      const taken = db().users.some(
        (item) =>
          item.id !== user.id && item.username.toLowerCase() === body.username.toLowerCase(),
      )
      if (taken) {
        throw new MockHttpError(409, 'CONFLICT', 'Este nome de usuário já está em uso', {
          username: ['Este nome de usuário já está em uso'],
        })
      }
      Object.assign(user, body)
      persist()
      return HttpResponse.json(toPublicUser(user))
    }),
  ),

  http.post(
    `${API}/profile/password`,
    route(async ({ request }) => {
      const user = requireUser(request)
      const body = await parseBody(request, changePasswordRequestSchema)
      if ((await hashPassword(body.currentPassword, user.salt)) !== user.passwordHash) {
        throw new MockHttpError(422, 'VALIDATION_ERROR', 'Senha atual incorreta', {
          currentPassword: ['Senha atual incorreta'],
        })
      }
      user.passwordHash = await hashPassword(body.newPassword, user.salt)
      persist()
      return new HttpResponse(null, { status: 204 })
    }),
  ),

  http.get(
    `${API}/wallets`,
    route(({ request }) => HttpResponse.json({ items: walletsOf(requireUser(request).id) })),
  ),

  http.post(
    `${API}/wallets`,
    route(async ({ request }) => {
      const user = requireUser(request)
      const body = await parseBody(request, upsertWalletRequestSchema)
      const wallets = walletsOf(user.id)
      if (wallets.some((wallet) => wallet.slot === body.slot)) {
        throw new MockHttpError(409, 'CONFLICT', 'Já existe uma carteira neste espaço', {
          slot: ['Já existe uma carteira neste espaço'],
        })
      }
      const wallet: Wallet = { id: createId('wal'), ...body }
      wallets.push(wallet)
      persist()
      return HttpResponse.json(wallet, { status: 201 })
    }),
  ),

  http.patch<{ id: string }>(
    `${API}/wallets/:id`,
    route<{ id: string }>(async ({ request, params }) => {
      const user = requireUser(request)
      const body = await parseBody(request, upsertWalletRequestSchema)
      const wallet = findWallet(user.id, params.id)
      const slotTaken = walletsOf(user.id).some(
        (item) => item.id !== wallet.id && item.slot === body.slot,
      )
      if (slotTaken) {
        throw new MockHttpError(409, 'CONFLICT', 'Já existe uma carteira neste espaço', {
          slot: ['Já existe uma carteira neste espaço'],
        })
      }
      Object.assign(wallet, body)
      persist()
      return HttpResponse.json(wallet)
    }),
  ),

  http.post<{ id: string }>(
    `${API}/wallets/:id/connect`,
    route<{ id: string }>(async ({ request, params }) => {
      const user = requireUser(request)
      const body = await parseBody(request, connectWalletRequestSchema)
      const wallet = findWallet(user.id, params.id)
      if (getScenario() === 'wallet-rejected') {
        throw new MockHttpError(403, 'WALLET_REJECTED', 'A carteira recusou a conexão')
      }
      return HttpResponse.json({ walletId: wallet.id, network: body.network, status: 'connected' })
    }),
  ),

  http.post<{ id: string }>(
    `${API}/wallets/:id/disconnect`,
    route<{ id: string }>(({ request, params }) => {
      const user = requireUser(request)
      const wallet = findWallet(user.id, params.id)
      return HttpResponse.json({
        walletId: wallet.id,
        network: wallet.network,
        status: 'disconnected',
      })
    }),
  ),
]
