import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().default('/api'),
  VITE_ENABLE_MOCKS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
})

export const env = envSchema.parse(import.meta.env)
