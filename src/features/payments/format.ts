/**
 * Money formatting helpers.
 *
 * Stripe convention: amounts are integer minor units (cents). We only
 * convert at the UI edge. Currency is ISO 4217 lowercase ("usd").
 */

export function formatAmount(cents: number, currency: string = 'usd'): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(dollars)
}

/** Parse a user-typed dollar string into integer cents. Returns NaN if invalid. */
export function parseAmountToCents(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '')
  if (!cleaned) return NaN
  const n = Number.parseFloat(cleaned)
  if (!Number.isFinite(n) || n < 0) return NaN
  // Round to avoid 19.99 → 1998.999... drift.
  return Math.round(n * 100)
}
