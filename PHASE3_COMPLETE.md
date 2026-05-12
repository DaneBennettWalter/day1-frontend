# Phase 3: AI Chat (Standalone) — COMPLETE ✅

**Completed:** 2026-05-12
**Location:** `~/Desktop/day1-rebuild/day1-frontend/`
**Tag:** `v0.4.0`

## Goal

Working AI chat against the backend proxy. Standalone — not yet wired into
documents. Proves the highest-value, highest-risk integration before P4 builds
document machinery around it.

## Deliverables

### ✅ AI Chat feature (`src/features/ai-chat/`)

- `types.ts` — `ChatMessage` (`role`, `content`, `id`, `createdAt`, `status`),
  `ChatSession`, `ChatRequest`/`Response`, `GenerateRequest`/`Response`.
- `api.ts` — `chat()` (buffered), `streamChat()` (SSE + JSON-fallback parser),
  `generate()` (P4-facing document generation).
- `store.ts` — Zustand store: multi-session, sessionStorage-backed, in-flight
  `AbortController`, hot-path optimization for streamed deltas (no per-token
  persistence write).
- `hooks.ts` — `useAiChat()` (sendMessage / retryMessage / stop / clear /
  newSession), `useAiAvailability()` (health probe), `useGenerateDocument()`
  (P4-facing).

### ✅ Components (`src/features/ai-chat/components/`)

- `MessageBubble.tsx` — role-styled bubble, react-markdown + rehype-sanitize,
  Prism code highlighting, retry button on failed user messages, typing
  indicator, formatted timestamps.
- `MessageList.tsx` — sticky-to-bottom scroll (only when user is already near
  bottom — no yank-down), auto-virtualizes past 50 messages with
  `@tanstack/react-virtual`.
- `Composer.tsx` — autosize textarea (max 240px), Enter/Cmd+Enter to send,
  Shift+Enter for newline, Escape to clear, draft persisted to sessionStorage
  per session id, Stop button while streaming.
- `SuggestedPrompts.tsx` — three example prompts (kitchen reno, line item add,
  material pricing) per the legacy app analysis.
- `ConversationSidebar.tsx` — lists sessions newest-first, switch/delete,
  collapses below `lg` breakpoint.

### ✅ Route

- `src/routes/chat.tsx` — `/chat` and `/chat/:conversationId`. Header with
  Clear + New buttons, AI-unavailable empty state with deep link to
  `/settings/ai`, composer sticky to bottom.

### ✅ Nav

- "AI Chat" enabled in `Sidebar.tsx` with Sparkles icon.

## Streaming architecture

The backend may speak SSE _or_ return a buffered JSON blob. The client probes
`Content-Type` and dispatches — UI code is identical either way.

**SSE path:**

- Parser handles `data: <text>\n\n` frames, concatenates multi-line `data:`
  fields, supports `{"delta": ...}` / `{"content": ...}` / `{"text": ...}`
  JSON envelopes, treats `[DONE]` as the terminator.
- Tokens emit via an `onToken(delta)` callback as they arrive.

**Buffered path:**

- `application/json` response → single `onToken` call with the full content.
- Any other content-type → treat body as a single text stream.

**Abort:**

- Each in-flight request gets an `AbortController`. User Stop, "Clear", "New
  session", and route unmount all abort. Aborts surface as a `failed` message
  with reason "Stopped".

## State model

- **Zustand** for messages — tokens arrive dozens of times per second; TanStack
  Query's cache model would fight that. We persist to `sessionStorage`, but
  _only_ on terminal events (new message, status change, session ops) — not on
  every streamed token.
- **TanStack Query** for the `/api/health` probe — read-mostly, cached 60s.

## Tests

| File                | Coverage                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `store.test.ts`     | 9 tests — session lifecycle, title derivation, delta concat, clear/delete, select-non-existent |
| `api.test.ts`       | 4 tests — SSE raw deltas, SSE JSON envelopes, JSON fallback, abort mid-stream                  |
| `Composer.test.tsx` | 6 tests — Enter sends, Shift+Enter newlines, disabled states, Escape clears, draft persistence |

**Suite totals:** 58 passing.

## Acceptance criteria (from plan)

- [x] Sending a message renders the user's message optimistically.
- [x] Server response renders as an `assistant` message; on error the message
      shows `failed` with a retry button.
- [x] Composer disables Send while a response is in flight; Enter sends;
      Shift+Enter inserts newline; Cmd/Ctrl+Enter sends.
- [x] "Clear" wipes the session; "New" starts a fresh session.
- [x] Long responses don't break layout; messages scroll to bottom as they arrive.
- [x] Markdown renders (lists, headings, code) and is XSS-safe (`rehype-sanitize`).
- [x] Draft survives navigating away and back within the session.
- [x] If `/api/health` reports `hasAI: false`, route shows "AI unavailable" empty
      state with a link to `/settings/ai`.
- [x] Suggested prompts populate the composer on click.
- [x] No API keys appear in the client bundle (only the user's session JWT).
- [x] Mobile-responsive: composer sticks to bottom, sidebar collapses.
- [x] Virtualized list past 50 messages.
- [x] Code syntax highlighting (Prism via `react-syntax-highlighter`).

## Files created

```
src/features/ai-chat/
├── api.ts
├── api.test.ts
├── hooks.ts
├── store.ts
├── store.test.ts
├── types.ts
└── components/
    ├── Composer.tsx
    ├── Composer.test.tsx
    ├── ConversationSidebar.tsx
    ├── MessageBubble.tsx
    ├── MessageList.tsx
    └── SuggestedPrompts.tsx
src/routes/chat.tsx
```

## Files modified

- `src/App.tsx` — `/chat` + `/chat/:conversationId` routes inside `AppShell`.
- `src/components/layout/Sidebar.tsx` — enabled "AI Chat" link with Sparkles icon.
- `src/lib/api/endpoints.ts` — added `ai.chat`, `ai.generate`, `ai.search`.
- `README.md` — Features section + AI Chat docs.

## Dependencies added

- `react-markdown` 10
- `remark-gfm` 4
- `rehype-sanitize` 6
- `react-syntax-highlighter` 16 (+ `@types/react-syntax-highlighter`)
- `@tanstack/react-virtual` 3

## Deferred to P4

- Server-side conversation persistence (currently sessionStorage-only).
- Embedding the chat into the document editor with a `currentEstimate` context prop.
- AI-applied changes diff/merge into document state.
- Real-backend smoke test (depends on backend deploy).

## Verification

```
$ pnpm type-check  # clean
$ pnpm lint        # clean
$ pnpm test        # 58 passed
$ pnpm build       # ✓ built in ~2.8s
```
