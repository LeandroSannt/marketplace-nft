import { http, HttpResponse } from 'msw'
import { loginRequestSchema, registerRequestSchema, type Session } from '@/contracts/auth'
import { db, persist, toPublicUser, type SessionRecord, type UserRecord } from '@/mocks/db'
import { createSalt, hashPassword } from '@/mocks/lib/crypto'
import { API, MockHttpError, parseBody, requireSession, route } from '@/mocks/lib/http'
import { createId } from '@/mocks/lib/random'

const SESSION_TTL_MS = 2 * 3600_000

function openSession(user: UserRecord): Session {
  const session: SessionRecord = {
    token: `tok_${crypto.randomUUID().replace(/-/g, '')}`,
    userId: user.id,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    revoked: false,
  }
  db().sessions.push(session)
  persist()
  return { token: session.token, expiresAt: session.expiresAt, user: toPublicUser(user) }
}

export const authHandlers = [
  http.post(
    `${API}/auth/register`,
    route(async ({ request }) => {
      const body = await parseBody(request, registerRequestSchema)
      const users = db().users
      const fields: Record<string, string[]> = {}
      if (users.some((user) => user.email === body.email)) {
        fields.email = ['Este e-mail já está cadastrado']
      }
      if (users.some((user) => user.username.toLowerCase() === body.username.toLowerCase())) {
        fields.username = ['Este nome de usuário já está em uso']
      }
      if (Object.keys(fields).length) {
        throw new MockHttpError(409, 'CONFLICT', 'Já existe uma conta com estes dados', fields)
      }

      const salt = createSalt()
      const user: UserRecord = {
        id: createId('usr'),
        username: body.username,
        email: body.email,
        displayName: body.username,
        avatarUrl: null,
        bio: '',
        website: '',
        ens: '',
        salt,
        passwordHash: await hashPassword(body.password, salt),
      }
      users.push(user)
      db().favorites[user.id] = []
      db().wallets[user.id] = []
      return HttpResponse.json(openSession(user), { status: 201 })
    }),
  ),

  http.post(
    `${API}/auth/login`,
    route(async ({ request }) => {
      const body = await parseBody(request, loginRequestSchema)
      const user = db().users.find((item) => item.email === body.email)
      const valid = user && (await hashPassword(body.password, user.salt)) === user.passwordHash
      if (!user || !valid) {
        throw new MockHttpError(401, 'UNAUTHORIZED', 'E-mail ou senha incorretos')
      }
      return HttpResponse.json(openSession(user))
    }),
  ),

  http.get(
    `${API}/auth/session`,
    route(({ request }) => {
      const { user, session } = requireSession(request)
      return HttpResponse.json({ expiresAt: session.expiresAt, user: toPublicUser(user) })
    }),
  ),

  http.post(
    `${API}/auth/logout`,
    route(({ request }) => {
      const token = request.headers.get('Authorization')?.slice(7)
      const session = db().sessions.find((item) => item.token === token)
      if (session) {
        session.revoked = true
        persist()
      }
      return new HttpResponse(null, { status: 204 })
    }),
  ),
]
