import { Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  'Estimate a kitchen renovation, 200 sq ft, mid-grade finishes.',
  'Add 20 more 2x4s to the framing line.',
  "What's the current price for pressure treated lumber?",
] as const

interface SuggestedPromptsProps {
  onPick: (text: string) => void
}

export function SuggestedPrompts({ onPick }: SuggestedPromptsProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Start a conversation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask the assistant to estimate work, look up materials, or draft bid
          line items.
        </p>
      </div>
      <div
        className="grid w-full gap-2 sm:grid-cols-3"
        data-testid="suggested-prompts"
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-md border bg-card p-3 text-left text-xs hover:bg-accent hover:text-accent-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
