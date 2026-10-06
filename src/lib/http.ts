import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { z } from 'zod'
import { ApiError, toApiError } from '@/lib/api-error'
import { env } from '@/lib/env'
import { networkReady } from '@/lib/network-ready'
import { guestCartStore, sessionStore } from '@/lib/session-store'

const DEFAULT_TIMEOUT_MS = 10_000

export const http = axios.create({
  baseURL: env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const CREDENTIAL_ENDPOINTS = ['/auth/login', '/auth/register']

http.interceptors.request.use(async (config) => {
  await networkReady
  if (CREDENTIAL_ENDPOINTS.includes(config.url ?? '')) return config
  const { token } = sessionStore.get()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  } else {
    const guestCartId = guestCartStore.get()
    if (guestCartId) config.headers.set('X-Cart-Id', guestCartId)
  }
  return config
})

http.interceptors.response.use(undefined, (error: unknown) => {
  const apiError = toApiError(error)
  const sentToken = axios.isAxiosError(error) && Boolean(error.config?.headers.Authorization)
  if (apiError.status === 401 && sentToken) sessionStore.expire()
  return Promise.reject(apiError)
})

async function send<T>({
  timeout,
  signal,
  ...config
}: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  const timer = new AbortController()
  const timeoutId = window.setTimeout(() => {
    timer.abort()
  }, timeout ?? DEFAULT_TIMEOUT_MS)
  const signals = signal instanceof AbortSignal ? [signal, timer.signal] : [timer.signal]
  try {
    return await http.request<T>({ ...config, signal: AbortSignal.any(signals) })
  } catch (error) {
    if (timer.signal.aborted) {
      throw new ApiError({
        status: 0,
        code: 'TIMEOUT',
        message: 'O servidor demorou para responder. Tente novamente.',
      })
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export async function apiRequest<T extends z.ZodType>(
  schema: T,
  config: AxiosRequestConfig,
): Promise<z.infer<T>> {
  const response = await send<unknown>(config)
  const parsed = schema.safeParse(response.data)
  if (!parsed.success) {
    throw new ApiError({
      status: response.status,
      code: 'INVALID_RESPONSE',
      message: 'Resposta inesperada do servidor',
      details: parsed.error.issues,
    })
  }
  return parsed.data
}

export async function apiVoid(config: AxiosRequestConfig): Promise<void> {
  await send(config)
}
