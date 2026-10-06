import { isAxiosError } from 'axios'
import { apiErrorSchema, type ApiErrorCode } from '@/contracts/common'

export type ClientErrorCode =
  ApiErrorCode | 'NETWORK_ERROR' | 'TIMEOUT' | 'CANCELED' | 'INVALID_RESPONSE'

interface ApiErrorInit {
  status: number
  code: ClientErrorCode
  message: string
  fields?: Record<string, string[]>
  details?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly code: ClientErrorCode
  readonly fields: Record<string, string[]>
  readonly details: unknown

  constructor(init: ApiErrorInit) {
    super(init.message)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.fields = init.fields ?? {}
    this.details = init.details
  }

  get isTransient() {
    return (
      this.code === 'NETWORK_ERROR' ||
      this.code === 'TIMEOUT' ||
      this.code === 'SERVICE_UNAVAILABLE' ||
      this.status >= 500
    )
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error
  if (!isAxiosError(error)) {
    return new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Erro inesperado. Tente novamente.',
    })
  }
  if (error.code === 'ERR_CANCELED') {
    return new ApiError({ status: 0, code: 'CANCELED', message: 'Requisição cancelada' })
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError({
      status: 0,
      code: 'TIMEOUT',
      message: 'O servidor demorou para responder. Tente novamente.',
    })
  }
  if (!error.response) {
    return new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Sem conexão com o servidor. Verifique sua internet.',
    })
  }
  const parsed = apiErrorSchema.safeParse(error.response.data)
  if (parsed.success) {
    return new ApiError({ status: error.response.status, ...parsed.data.error })
  }
  return new ApiError({
    status: error.response.status,
    code: error.response.status >= 500 ? 'INTERNAL_ERROR' : 'INVALID_RESPONSE',
    message: 'Não foi possível concluir a operação. Tente novamente.',
  })
}
