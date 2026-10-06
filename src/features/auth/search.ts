import { z } from 'zod'

export const authSearchSchema = z.object({
  redirect: z
    .string()
    .regex(/^\/(?!\/)/, 'Redirecionamento deve ser interno')
    .optional()
    .catch(undefined),
})

export type AuthSearch = z.infer<typeof authSearchSchema>
