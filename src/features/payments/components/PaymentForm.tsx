/**
 * PaymentForm — Stripe Elements card capture + intent confirmation.
 *
 * Flow:
 *  1. User enters amount + description.
 *  2. We POST /api/payments/create-intent → returns clientSecret.
 *  3. Stripe Elements card field is mounted; user enters card.
 *  4. On submit, `stripe.confirmCardPayment(clientSecret, …)` runs.
 *     Stripe handles 3D Secure / SCA challenges in a modal automatically.
 *  5. We POST /api/payments/confirm to reconcile our DB row.
 *
 * Critical guarantees:
 *  - Raw PAN never enters React state or our backend.
 *  - The publishable key is the only Stripe secret on the client.
 *  - Errors from Stripe (card_declined, etc.) surface verbatim.
 *  - If Stripe isn't configured, render a clear disabled state.
 */

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useConfirmPayment, useCreatePaymentIntent } from '../hooks'
import { parseAmountToCents } from '../format'
import {
  isStripeConfigured,
  loadStripe,
  type StripeCardElement,
  type StripeJs,
} from '../stripe'

interface PaymentFormProps {
  defaultAmount?: number
  documentId?: string
  onSuccess?: (paymentId: string) => void
}

export function PaymentForm({
  defaultAmount,
  documentId,
  onSuccess,
}: PaymentFormProps) {
  const stripeReady = isStripeConfigured()
  const [amount, setAmount] = useState(
    defaultAmount != null ? (defaultAmount / 100).toFixed(2) : ''
  )
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const stripeRef = useRef<StripeJs | null>(null)
  const cardRef = useRef<StripeCardElement | null>(null)
  const cardMountRef = useRef<HTMLDivElement | null>(null)

  const createIntent = useCreatePaymentIntent()
  const confirmPayment = useConfirmPayment()

  // Mount Stripe Elements when configured.
  useEffect(() => {
    if (!stripeReady) return
    let cancelled = false
    void loadStripe().then((stripe) => {
      if (cancelled || !stripe || !cardMountRef.current) return
      stripeRef.current = stripe
      const elements = stripe.elements()
      const card = elements.create('card', {
        style: {
          base: {
            fontSize: '15px',
            color: 'hsl(var(--foreground))',
            '::placeholder': { color: 'hsl(var(--muted-foreground))' },
          },
        },
      })
      card.mount(cardMountRef.current)
      card.on('change', (e) => setCardError(e.error?.message ?? null))
      cardRef.current = card
    })
    return () => {
      cancelled = true
      cardRef.current?.unmount()
      cardRef.current?.destroy()
      cardRef.current = null
    }
  }, [stripeReady])

  if (!stripeReady) {
    return (
      <div
        role="alert"
        className="rounded-md border border-dashed bg-muted/40 p-6 text-sm"
      >
        <p className="font-medium">Payments are not configured.</p>
        <p className="mt-1 text-muted-foreground">
          Set{' '}
          <code className="rounded bg-background px-1 py-0.5 text-xs">
            VITE_STRIPE_PUBLISHABLE_KEY
          </code>{' '}
          in your environment to enable card payments. See{' '}
          <code className="rounded bg-background px-1 py-0.5 text-xs">
            .env.example
          </code>
          .
        </p>
      </div>
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void handleSubmit(e)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    const cents = parseAmountToCents(amount)
    if (!Number.isFinite(cents) || cents <= 0) {
      setFormError('Enter a valid amount greater than $0.00.')
      return
    }
    if (!stripeRef.current || !cardRef.current) {
      setFormError('Payment form is still loading. Try again in a moment.')
      return
    }

    setSubmitting(true)
    try {
      const intent = await createIntent.mutateAsync({
        amount: cents,
        description: description || undefined,
        documentId,
      })

      // Stripe handles 3D Secure (SCA) automatically when required.
      const result = await stripeRef.current.confirmCardPayment(
        intent.clientSecret,
        { payment_method: { card: cardRef.current } }
      )

      if (result.error) {
        setFormError(result.error.message)
        return
      }

      if (!result.paymentIntent) {
        setFormError('Payment did not complete. Please try again.')
        return
      }

      const confirmed = await confirmPayment.mutateAsync({
        paymentId: intent.paymentId,
        stripePaymentIntentId: result.paymentIntent.id,
      })

      // Reset card field after success.
      cardRef.current.unmount()
      cardRef.current.mount(cardMountRef.current!)
      setAmount('')
      setDescription('')
      onSuccess?.(confirmed.id)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Payment form"
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="payment-amount">Amount (USD)</Label>
        <Input
          id="payment-amount"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-required="true"
          aria-invalid={formError ? 'true' : 'false'}
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-description">Description (optional)</Label>
        <Textarea
          id="payment-description"
          placeholder="What's this payment for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-card">Card details</Label>
        <div
          id="payment-card"
          ref={cardMountRef}
          className="rounded-md border bg-background px-3 py-3"
          aria-label="Credit or debit card"
        />
        {cardError ? (
          <p role="alert" className="text-sm text-destructive">
            {cardError}
          </p>
        ) : null}
      </div>

      {formError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {formError}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Processing…
          </>
        ) : (
          'Pay now'
        )}
      </Button>

      <p className="text-xs text-muted-foreground">
        Payments are processed by Stripe. We never see your card number.
      </p>
    </form>
  )
}
