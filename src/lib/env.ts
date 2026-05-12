import { z } from 'zod'

const schema = z.object({
  VITE_API_BASE_URL: z.string().default('/api'),
  VITE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('production'),
  /**
   * Stripe publishable key. Safe to expose to the browser by design
   * (Stripe explicitly publishes these). Empty disables payments UI.
   */
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().default(''),
})

const parsed = schema.safeParse(import.meta.env)

if (!parsed.success) {
  console.error(
    'Invalid environment variables:',
    parsed.error.flatten().fieldErrors
  )
  throw new Error('Invalid environment variables. See .env.example.')
}

export const env = parsed.data
