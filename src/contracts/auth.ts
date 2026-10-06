import { z } from 'zod'
import { isoDateSchema } from '@/contracts/common'

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Use pelo menos 3 caracteres')
  .max(24, 'Use no máximo 24 caracteres')
  .regex(/^[a-z0-9_.]+$/i, 'Use apenas letras, números, ponto e sublinhado')

export const emailSchema = z.email('Informe um e-mail válido').trim().toLowerCase()

export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Za-z]/, 'Inclua pelo menos uma letra')
  .regex(/\d/, 'Inclua pelo menos um número')

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string(),
  website: z.string(),
  ens: z.string(),
})
export type User = z.infer<typeof userSchema>

export const sessionSchema = z.object({
  token: z.string(),
  expiresAt: isoDateSchema,
  user: userSchema,
})
export type Session = z.infer<typeof sessionSchema>

export const currentSessionSchema = z.object({
  expiresAt: isoDateSchema,
  user: userSchema,
})
export type CurrentSession = z.infer<typeof currentSessionSchema>

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe sua senha'),
})
export type LoginRequest = z.infer<typeof loginRequestSchema>

export const registerRequestSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
})
export type RegisterRequest = z.infer<typeof registerRequestSchema>
