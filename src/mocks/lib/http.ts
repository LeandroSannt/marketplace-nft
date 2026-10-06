import { delay, HttpResponse, type DefaultBodyType, type PathParams, type StrictRequest } from 'msw'
import type { z } from 'zod'
import type { ApiErrorBody, ApiErrorCode } from '@/contracts/common'
import { db, type SessionRecord, type UserRecord } from '@/mocks/db'
import { getScenario } from '@/mocks/scenarios'

export const API = '/api'

export class MockHttpError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly fields?: Record<string, string[]>
  readonly details?: unknown

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    fields?: Record<string, string[]>,
    details?: unknown,
  ) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields
    this.details = details
  }

  toResponse() {
    const body: ApiErrorBody = {
      error: { code: this.code, message: this.message, fields: this.fields, details: this.details },
    }
    return HttpResponse.json(body, { status: this.status })
  }
}

const VARIABLE_DELAYS = [1200, 200, 700, 150, 900, 300]
const flakyAttempts = new Set<string>()
let variableIndex = 0

export function resetNetworkState() {
  flakyAttempts.clear()
  variableIndex = 0
}

function latencyFor(request: Request) {
  switch (getScenario()) {
    case 'slow-network':
      return 2500
    case 'variable-latency': {
      const value = VARIABLE_DELAYS[variableIndex % VARIABLE_DELAYS.length] ?? 300
      variableIndex += 1
      return value
    }
    default:
      return request.method === 'GET' ? 150 : 250
  }
}

async function simulateNetwork(request: Request): Promise<Response | null> {
  const scenario = getScenario()
  const { pathname } = new URL(request.url)

  if (scenario === 'offline') return HttpResponse.error()

  await delay(latencyFor(request))

  const isCatalogRead =
    request.method === 'GET' &&
    /^\/api\/nfts(\/[^/]+)?$/.test(pathname) &&
    pathname !== '/api/nfts/featured'
  if (scenario === 'server-error' && isCatalogRead) {
    return new MockHttpError(
      500,
      'INTERNAL_ERROR',
      'Erro interno ao consultar o catálogo',
    ).toResponse()
  }

  if (scenario === 'flaky' && request.method === 'GET') {
    const key = `${request.method} ${pathname}`
    if (!flakyAttempts.has(key)) {
      flakyAttempts.add(key)
      return new MockHttpError(
        503,
        'SERVICE_UNAVAILABLE',
        'Serviço temporariamente indisponível',
      ).toResponse()
    }
  }

  return null
}

type ResolverInfo<Params extends PathParams> = {
  request: StrictRequest<DefaultBodyType>
  params: Params
}

export function route<Params extends PathParams = PathParams>(
  resolver: (info: ResolverInfo<Params>) => Response | Promise<Response>,
) {
  return async (info: ResolverInfo<Params>) => {
    const failure = await simulateNetwork(info.request)
    if (failure) return failure
    try {
      return await resolver(info)
    } catch (error) {
      if (error instanceof MockHttpError) return error.toResponse()
      throw error
    }
  }
}

export async function parseBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  const body: unknown = await request.json().catch(() => null)
  const result = schema.safeParse(body)
  if (!result.success) {
    const fields: Record<string, string[]> = {}
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || 'body'
      fields[key] = [...(fields[key] ?? []), issue.message]
    }
    throw new MockHttpError(422, 'VALIDATION_ERROR', 'Verifique os campos destacados', fields)
  }
  return result.data
}

function readToken(request: Request) {
  const header = request.headers.get('Authorization')
  return header?.startsWith('Bearer ') ? header.slice(7) : null
}

export function findSession(token: string | null): SessionRecord | undefined {
  if (!token) return undefined
  return db().sessions.find((session) => session.token === token)
}

export function isSessionActive(session: SessionRecord) {
  return !session.revoked && new Date(session.expiresAt).getTime() > Date.now()
}

export function optionalUser(request: Request): UserRecord | null {
  const session = findSession(readToken(request))
  if (!session || !isSessionActive(session)) return null
  return db().users.find((user) => user.id === session.userId) ?? null
}

export function requireSession(request: Request): { user: UserRecord; session: SessionRecord } {
  const token = readToken(request)
  const session = findSession(token)
  if (!token || !session || session.revoked) {
    throw new MockHttpError(401, 'UNAUTHORIZED', 'Faça login para continuar')
  }
  if (!isSessionActive(session)) {
    throw new MockHttpError(401, 'SESSION_EXPIRED', 'Sua sessão expirou. Entre novamente.')
  }
  const user = db().users.find((item) => item.id === session.userId)
  if (!user) throw new MockHttpError(401, 'UNAUTHORIZED', 'Faça login para continuar')
  return { user, session }
}

export function requireUser(request: Request): UserRecord {
  return requireSession(request).user
}

export function forbidden(message: string) {
  return new MockHttpError(403, 'FORBIDDEN', message)
}

export function notFound(message: string) {
  return new MockHttpError(404, 'NOT_FOUND', message)
}
