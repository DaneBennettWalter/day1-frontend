/**
 * Stripe.js loader.
 *
 * We load Stripe.js from `js.stripe.com` on demand (no bundler dep)
 * so the entry bundle stays lean and PCI scope stays on Stripe's
 * domain. The script is appended once and memoized.
 *
 * Returns `null` when no publishable key is configured — the UI uses
 * that signal to render a disabled state with a helpful message.
 *
 * Security:
 *  - Publishable key is intentionally public (Stripe says so).
 *  - We never log the key (no `console.log(env...)`).
 *  - Raw card data is collected by Stripe Elements only — it never
 *    touches our React state or our backend.
 */

import { env } from '@/lib/env'

// Minimal surface we use. Avoids pulling @stripe/stripe-js types.
export interface StripeJs {
  elements(options?: Record<string, unknown>): StripeElements
  confirmCardPayment(
    clientSecret: string,
    data?: { payment_method?: { card: StripeCardElement } }
  ): Promise<StripeConfirmResult>
}

export interface StripeElements {
  create(type: 'card', options?: Record<string, unknown>): StripeCardElement
}

export interface StripeCardElement {
  mount(node: HTMLElement | string): void
  unmount(): void
  on(
    event: string,
    handler: (event: { error?: { message: string } }) => void
  ): void
  destroy(): void
}

export interface StripeConfirmResult {
  paymentIntent?: { id: string; status: string }
  error?: { message: string; code?: string; type?: string }
}

declare global {
  interface Window {
    Stripe?: (key: string) => StripeJs
  }
}

const STRIPE_JS_URL = 'https://js.stripe.com/v3/'
let scriptPromise: Promise<void> | null = null
let stripeInstance: StripeJs | null = null

function injectScript(): Promise<void> {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${STRIPE_JS_URL}"]`
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Stripe.js')),
        { once: true }
      )
      if (window.Stripe) resolve()
      return
    }
    const s = document.createElement('script')
    s.src = STRIPE_JS_URL
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Stripe.js'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

/**
 * Resolve a Stripe instance. Returns null when payments are not configured
 * (no publishable key); the UI handles that branch explicitly.
 */
export async function loadStripe(): Promise<StripeJs | null> {
  if (!env.VITE_STRIPE_PUBLISHABLE_KEY) return null
  if (stripeInstance) return stripeInstance
  await injectScript()
  if (!window.Stripe) throw new Error('Stripe.js failed to initialize')
  stripeInstance = window.Stripe(env.VITE_STRIPE_PUBLISHABLE_KEY)
  return stripeInstance
}

export function isStripeConfigured(): boolean {
  return Boolean(env.VITE_STRIPE_PUBLISHABLE_KEY)
}
