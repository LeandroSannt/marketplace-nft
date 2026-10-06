import {
  currentSessionSchema,
  sessionSchema,
  type LoginRequest,
  type RegisterRequest,
} from '@/contracts/auth'
import { apiRequest, apiVoid } from '@/lib/http'

export const authApi = {
  login: (body: LoginRequest) =>
    apiRequest(sessionSchema, { method: 'POST', url: '/auth/login', data: body }),
  register: (body: RegisterRequest) =>
    apiRequest(sessionSchema, { method: 'POST', url: '/auth/register', data: body }),
  session: (signal?: AbortSignal) =>
    apiRequest(currentSessionSchema, { method: 'GET', url: '/auth/session', signal }),
  logout: () => apiVoid({ method: 'POST', url: '/auth/logout' }),
}
