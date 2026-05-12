import { z } from 'zod'

const schema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
})

const parsed = schema.safeParse(import.meta.env)

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables. See .env.example.')
}

export const env = parsed.data
