import { z } from 'zod'
import { passwordSchema, usernameSchema } from '@/contracts/auth'

export const AVATAR_MAX_BYTES = 512 * 1024

export const updateProfileRequestSchema = z.object({
  displayName: z.string().trim().min(2, 'Use pelo menos 2 caracteres').max(40),
  username: usernameSchema,
  bio: z.string().trim().max(160, 'Use no máximo 160 caracteres'),
  website: z.union([z.literal(''), z.url('Informe uma URL válida (https://...)')]),
  ens: z.union([
    z.literal(''),
    z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i, 'Informe um nome ENS válido (.eth)'),
  ]),
  avatarUrl: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/, 'Envie uma imagem PNG, JPG ou WebP')
    .nullable(),
})
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>

export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    message: 'A nova senha deve ser diferente da atual',
    path: ['newPassword'],
  })
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>
