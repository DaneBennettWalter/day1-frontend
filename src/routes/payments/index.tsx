/**
 * /payments — overview: new-payment form on the left, history on the right.
 *
 * Two columns on desktop, stacked on mobile. The form is sticky-friendly
 * but we leave that to a future polish pass.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentForm } from '@/features/payments/components/PaymentForm'
import { PaymentsList } from '@/features/payments/components/PaymentsList'

export default function PaymentsRoute() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Collect a card payment or review past activity.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>New payment</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentsList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
