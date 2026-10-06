import { delay, http, HttpResponse } from 'msw'
import { createOrderRequestSchema, orderStatusSchema } from '@/contracts/order'
import { quoteRequestSchema } from '@/contracts/quote'
import { consumeTrigger, db, persist } from '@/mocks/db'
import { resolveCart, userCart } from '@/mocks/domain/cart'
import {
  createOrder,
  findOrderByKey,
  scheduleCheckoutShock,
  settleOrder,
  toOrderResponse,
} from '@/mocks/domain/orders'
import {
  buildQuote,
  isSameQuote,
  priceChanges,
  saveQuote,
  toQuoteResponse,
} from '@/mocks/domain/pricing'
import { hashJson } from '@/mocks/lib/crypto'
import {
  API,
  MockHttpError,
  forbidden,
  notFound,
  optionalUser,
  parseBody,
  requireSession,
  requireUser,
  route,
} from '@/mocks/lib/http'
import { getScenario } from '@/mocks/scenarios'

export const ORDER_TIMEOUT_DELAY_MS = 15_000

function expireSessionOnce(request: Request) {
  if (getScenario() !== 'session-expires-on-checkout') return
  const { session } = requireSession(request)
  if (!consumeTrigger('session-expires-on-checkout')) return
  session.expiresAt = new Date(Date.now() - 1000).toISOString()
  persist()
  throw new MockHttpError(401, 'SESSION_EXPIRED', 'Sua sessão expirou. Entre novamente.')
}

export const checkoutHandlers = [
  http.post(
    `${API}/quotes`,
    route(async ({ request }) => {
      const body = await parseBody(request, quoteRequestSchema)
      if (body.stage === 'checkout') {
        expireSessionOnce(request)
        requireUser(request)
      }
      const user = optionalUser(request)
      const cart = resolveCart(request, user)
      const quote = saveQuote(buildQuote(cart, body.network, user?.id ?? null))
      persist()
      if (body.stage === 'checkout') scheduleCheckoutShock(quote)
      return HttpResponse.json(toQuoteResponse(quote))
    }),
  ),

  http.post(
    `${API}/orders`,
    route(async ({ request }) => {
      const user = requireUser(request)
      const idempotencyKey = request.headers.get('Idempotency-Key')
      if (!idempotencyKey) {
        throw new MockHttpError(422, 'VALIDATION_ERROR', 'Cabeçalho Idempotency-Key obrigatório')
      }
      const body = await parseBody(request, createOrderRequestSchema)
      const requestHash = await hashJson(body)

      const existing = findOrderByKey(user.id, idempotencyKey)
      if (existing) {
        if (existing.requestHash !== requestHash) {
          throw new MockHttpError(
            409,
            'IDEMPOTENCY_CONFLICT',
            'Esta tentativa de compra já foi usada com outros dados',
          )
        }
        return HttpResponse.json(toOrderResponse(existing), { status: 200 })
      }

      const quote = db().quotes[body.quoteId]
      if (!quote || quote.userId !== user.id) throw notFound('Cotação não encontrada')

      const wallet = db().wallets[user.id]?.find((item) => item.id === body.walletId)
      if (!wallet) {
        throw new MockHttpError(422, 'VALIDATION_ERROR', 'Selecione uma carteira cadastrada', {
          walletId: ['Selecione uma carteira cadastrada'],
        })
      }

      const fresh = buildQuote(userCart(user.id), body.network, user.id)
      const expired = new Date(quote.expiresAt).getTime() < Date.now()
      if (expired || !isSameQuote(quote, fresh) || fresh.lines.length === 0) {
        const current = saveQuote(fresh)
        persist()
        throw new MockHttpError(
          409,
          'QUOTE_OUTDATED',
          'Preço, disponibilidade ou taxas mudaram. Revise o pedido antes de confirmar.',
          undefined,
          {
            quote: toQuoteResponse(current),
            issues: [...priceChanges(quote, current), ...current.issues],
          },
        )
      }

      const order = createOrder({ user, quote, request: body, idempotencyKey, requestHash })

      if (getScenario() === 'order-timeout' && consumeTrigger(`order-timeout:${idempotencyKey}`)) {
        await delay(ORDER_TIMEOUT_DELAY_MS)
      }

      return HttpResponse.json(toOrderResponse(order), { status: 201 })
    }),
  ),

  http.get(
    `${API}/orders`,
    route(({ request }) => {
      const user = requireUser(request)
      const status = orderStatusSchema.safeParse(new URL(request.url).searchParams.get('status'))
      const items = Object.values(db().orders)
        .filter(
          (order) => order.userId === user.id && (!status.success || order.status === status.data),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(toOrderResponse)
      return HttpResponse.json({ items })
    }),
  ),

  http.get<{ id: string }>(
    `${API}/orders/:id`,
    route<{ id: string }>(({ request, params }) => {
      const user = requireUser(request)
      const order = db().orders[params.id]
      if (!order) throw notFound('Pedido não encontrado')
      if (order.userId !== user.id) throw forbidden('Este pedido pertence a outra conta')
      if (order.status === 'pending' && new Date(order.settleAt).getTime() <= Date.now()) {
        settleOrder(order.id)
      }
      return HttpResponse.json(toOrderResponse(order))
    }),
  ),
]
