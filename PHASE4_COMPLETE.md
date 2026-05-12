# Phase 4: Documents — COMPLETE ✅

**Completed:** 2026-05-12
**Location:** `~/Desktop/day1-rebuild/day1-frontend/`
**Tag:** `v0.5.0`

## Goal

Document management for the foundation's billing + project pipeline. Ships
five document types (bid, invoice, estimate, work_order, proposal) with a
list view, drag-and-drop kanban, form-based editor, AI generation, and
browser print/PDF.

## Deliverables

### ✅ Documents feature (`src/features/documents/`)

- `types.ts` — `Document`, `DocumentType` (10 total, 5 shipped),
  `DocumentStatus` (draft / sent / approved / rejected), `LineItem`,
  `DocumentTotals`, list/create/update/delete IO types.
- `schemas.ts` — Zod schemas with input coercion; the form is string-in,
  number-out at the boundary.
- `calculations.ts` — pure totals engine: `lineTotal`, `computeTotals`,
  `splitByKind`, `formatCurrency`, `formatPercent`. Cents-rounded
  aggregates.
- `aiParse.ts` — defensive coercion of `/api/ai/generate` payloads into a
  `Partial<DocumentInput>`. Handles snake_case, percent-vs-decimal rates,
  currency formatting, nested envelopes, garbage line items.
- `api.ts` — typed client over `/api/documents` + query-string builder.
- `hooks.ts` — `useDocumentsList`, `useDocument`, `useCreateDocument`,
  `useUpdateDocument`, `useDeleteDocument`, `useChangeDocumentStatus`
  (optimistic), `useGenerateAiDocument`, `blankDocument`.

### ✅ Components (`src/features/documents/components/`)

- `LineItems.tsx` — `useFieldArray` table: add/remove rows, material/labor
  selector with colored pill, quantity, unit price, taxable checkbox,
  auto-computed line total.
- `TotalsPanel.tsx` — live totals (materials, labor, subtotal, tax,
  overhead, total) via `useWatch`. Sticky on lg breakpoint.
- `DocumentEditor.tsx` — single form, type-driven sections:
  - Always: type / status / number / title / description / customer /
    property / line items / tax + overhead.
  - Invoice: due date + payment terms.
  - Work order: assigned-to + tasks (textarea ↔ `string[]` via Controller).
- `AiGenerateModal.tsx` — type picker + description + examples per type.
  Parses response, merges patch over current form values.
- `DocumentList.tsx` — sortable TanStack-table list. Auto-virtualizes past
  100 rows. Filters: search, type, status, date range. Row click → edit.
- `Kanban.tsx` — four-column dnd-kit pipeline. Pointer + keyboard sensors,
  `DragOverlay`, optimistic status changes.
- `StatusBadge.tsx` — colored pill shared across list, kanban, print.
- `PrintView.tsx` — letterhead-style print template. Hidden offscreen until
  `window.print()`.

### ✅ Routes

- `src/routes/documents/list.tsx` — `/documents`
- `src/routes/documents/kanban.tsx` — `/documents/kanban`
- `src/routes/documents/new.tsx` — `/documents/new` (supports `?type=`)
- `src/routes/documents/edit.tsx` — `/documents/:id/edit`

### ✅ Wiring

- `src/App.tsx` — four new routes inside `AppShell`.
- `src/components/layout/Sidebar.tsx` — `Documents` link enabled.
- `src/lib/api/endpoints.ts` — `documents.{list,get,create,update,delete}`.
- `src/index.css` — `@media print` stylesheet hiding everything except
  `.print-area`; `.print-only` utility to keep the template offscreen.
- `src/components/ui/modal.tsx` — minimal accessible modal helper.

## Architecture notes

### Calculation engine

Pure functions. No React. Cents-rounded aggregates to avoid float drift:

```
lineTotal       = qty × unitPrice
subtotal        = Σ lineTotal
taxableSubtotal = Σ lineTotal where taxable=true
tax             = taxableSubtotal × taxRate
overhead        = subtotal × overheadRate
total           = subtotal + tax + overhead
```

Negative inputs clamp to 0; `NaN`/`Infinity` coerce to 0. Server is
authoritative — client computes for live UI only.

### Optimistic kanban

`useChangeDocumentStatus.onMutate` snapshots every active list-query cache,
rewrites the moved doc's status in place, returns the snapshot. `onError`
restores it. `onSettled` invalidates so the next refetch reconciles. Cards
appear to snap into the new column with zero perceptible latency.

### AI generation

The `/api/ai/generate` endpoint is loose by design — `Record<string,
unknown>`. The hot path is `parseAiDocument()`, which is fully defensive:

- Strips `$` / `,` / `%` / whitespace from numbers.
- Coerces percent-form rates (`8.25`) to decimal (`0.0825`).
- Accepts `lineItems`, `line_items`, or `items` for the array.
- Accepts `description`, `name`, `title`, `item` for the line label.
- Drops rows missing a description rather than throwing.
- Unwraps `{ document: {…} }` envelopes transparently.

Never throws. Worst case returns `{}` and the user fills it in.

### Print / PDF

No client-side PDF library. The print stylesheet hides everything except
elements with class `.print-area`. The edit route renders a hidden
`<PrintView doc={doc} />`; **Print / PDF** calls `window.print()` and the
browser handles "Save as PDF" from there. A real PDF generator (server-side
puppeteer or `pdfmake`) can drop in later without UI changes.

### Virtualization

`@tanstack/react-virtual` engages past 100 rows. Below that the table
renders normally — virtualization has measurement cost not worth paying
for small lists. The threshold is in `VIRTUALIZE_THRESHOLD` in
`DocumentList.tsx`.

### Unsaved-changes guard

`beforeunload` listener on the editor checks `formState.isDirty`. Modern
browsers show a generic prompt; custom strings are ignored. In-app
navigation guard is intentionally deferred — react-router v6 removed
`<Prompt>`, and `unstable_useBlocker` is brittle.

## Acceptance criteria (from plan)

- [x] Document list with filters working (type, status, date range, search).
- [x] Kanban board with drag-and-drop status changes.
- [x] Editor for 5 document types (bid, invoice, estimate, work_order, proposal).
- [x] Line items calculations accurate (88 test cases across calc + schemas + AI parsing).
- [x] AI generation creates valid documents (parses snake_case, percent rates, currency strings, etc.).
- [x] Print/PDF works (browser print → "Save as PDF").
- [x] README updated.
- [x] Tests: calculations, form validation, AI parsing.
- [x] Type-check clean. Lint clean (0 errors, 0 warnings). Build clean.
- [x] Git commit + tag v0.5.0.
- [x] Push to GitHub.

## Tests

| File                   | Coverage                                                                          |
| ---------------------- | --------------------------------------------------------------------------------- |
| `calculations.test.ts` | 14 tests — rounding, taxable subset, overhead, materials/labor split, formatting  |
| `schemas.test.ts`      | 9 tests — coercion, required fields, decimal-rate guard, email validation        |
| `aiParse.test.ts`      | 13 tests — snake_case, percent rates, customer block, invalid items, currency    |
| `hooks.test.ts`        | 4 tests — blank-document defaults, query-key namespacing                          |

**Suite totals:** 98 passing (up from 58 after P3).

## Verification

```
$ pnpm type-check  # clean
$ pnpm lint        # clean (0 errors, 0 warnings)
$ pnpm test        # 98 passed
$ pnpm build       # ✓ built in ~3s, gzip 449 kB
```

## Dependencies added

- `@dnd-kit/core` 6.3
- `@dnd-kit/sortable` 10
- `@dnd-kit/utilities` 3.2
- `@tanstack/react-table` 8.21

## Deferred

- Server-side PDF rendering (puppeteer microservice).
- The other 5 document types (lease, contract, receipt, purchase_order,
  change_order) — schema already supports them; surface them when product
  decides priority.
- In-app navigation guard (`unstable_useBlocker`) for unsaved changes.
- Multi-select bulk operations on the list view.
- WYSIWYG description (currently plain textarea — fine for the audit
  trail; can layer TipTap later if needed).
- AI chat embedded directly inside the editor with `currentEstimate`
  context (P3 deferral — wires in when document persistence lands
  server-side).

## Files created

```
src/features/documents/
├── api.ts
├── aiParse.ts
├── aiParse.test.ts
├── calculations.ts
├── calculations.test.ts
├── hooks.ts
├── hooks.test.ts
├── schemas.ts
├── schemas.test.ts
├── types.ts
└── components/
    ├── AiGenerateModal.tsx
    ├── DocumentEditor.tsx
    ├── DocumentList.tsx
    ├── Kanban.tsx
    ├── LineItems.tsx
    ├── PrintView.tsx
    ├── StatusBadge.tsx
    └── TotalsPanel.tsx
src/routes/documents/
├── edit.tsx
├── kanban.tsx
├── list.tsx
└── new.tsx
src/components/ui/modal.tsx
```

## Files modified

- `src/App.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/index.css` — print stylesheet
- `src/lib/api/endpoints.ts` — `documents.*`
- `README.md` — Features + Documents section
- `package.json` — `+@dnd-kit/*`, `+@tanstack/react-table`
