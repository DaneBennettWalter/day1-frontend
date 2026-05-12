# Phase 1: Auth + Dashboard Shell — COMPLETE ✅

**Completed:** 2026-05-12
**Location:** `~/Desktop/day1-rebuild/day1-frontend/`
**Git commit:** `16ee908`
**Tag:** `v0.2.0`

## Deliverables

### ✅ API Client Foundation (`src/lib/api/`)
- `client.ts` — `request<T>()` with Authorization auto-attach, 401 → single-flight refresh → retry-once, `AbortSignal`, `credentials: 'include'`
- `errors.ts` — `ApiError` class with `fromResponse()` parser
- `endpoints.ts` — centralized endpoint string constants
- `configureApiClient()` breaks the circular dep between client and auth store (configured once in `main.tsx`)

### ✅ Auth Feature (`src/features/auth/`)
- `types.ts` — `User`, `Session`, `LoginInput`, `RegisterInput`, `AuthResponse`, `AuthStatus`
- `api.ts` — `login`, `register`, `logout`, `me`, `refresh`
- `store.ts` — Zustand: `{ user, accessToken, status, refreshPromise }` with **single-flight refresh** (concurrent callers share one in-flight promise)
- `hooks.ts` — `useAuth`, `useLogin`, `useRegister`, `useLogout` (TanStack Query mutations)
- `guards.tsx` — `<RequireAuth>`, `<RedirectIfAuthed>`
- `schemas.ts` — Zod schemas for login + register forms

### ✅ Dashboard Shell
- `features/dashboard/DashboardPage.tsx` — placeholder ("Welcome back, {name}"), widget grid placeholder
- `components/layout/AppShell.tsx` — sidebar + topbar + `<Outlet />`, gated by `<RequireAuth>`
- `components/layout/MarketingShell.tsx` — public layout, gated by `<RedirectIfAuthed>`
- `components/layout/Sidebar.tsx` — nav with disabled "Coming soon" stubs (Documents, Contacts, Properties, Settings)
- `components/layout/TopBar.tsx` — user info + Log out button

### ✅ Routes (React Router v6)
- `/login` — public, RHF + Zod, calls `useLogin`, redirects to `?next=` or `/dashboard`
- `/register` — public, RHF + Zod, name + email + 8-char password
- `/dashboard` — protected
- `/` and `*` → `/dashboard` (router auto-handles redirect to `/login` via guards)

### ✅ Feedback Components
- `FullPageSpinner` — shown by `<RequireAuth>` during initial hydration so we never flash unauthenticated UI
- `Toaster` — sonner wrapper (top-right, rich colors)
- `ErrorBoundary` — app-root, ready for Sentry integration later

### ✅ Infra
- `src/lib/env.ts` — Zod-validated env vars
- `src/lib/query.ts` — `QueryClient` (30s staleTime, no retry on 4xx, no refetch on focus)
- `.env.example` committed
- `vitest.config.ts` + `src/test/setup.ts` (jsdom)

### ✅ Tests (23 passing)
- `src/features/auth/store.test.ts` (5) — setSession, clearSession, **single-flight refresh** (concurrent calls share one promise), failure resets state, refreshPromise cleared after settlement
- `src/features/auth/guards.test.tsx` (5) — spinner during loading, children when authed, redirect to /login when unauthed, inverse guard redirects authed users
- `src/features/auth/schemas.test.ts` (7) — email/password/name validation rules
- `src/lib/api/client.test.ts` (6) — Authorization header, 401 → refresh → retry, refresh failure calls onAuthLost, retry doesn't loop refresh

## Verification

```
✓ pnpm typecheck        clean
✓ pnpm lint             0 errors, 0 warnings (max-warnings 0)
✓ pnpm test             23/23 pass in 1.0s
✓ pnpm build            362 kB / 112 kB gzip
```

## Security Posture

- **Access token: memory only.** Lives in Zustand state, never `localStorage` or `sessionStorage`. Lost on tab close — by design; the HttpOnly refresh cookie rehydrates on next page load via `store.hydrate()` in `main.tsx`.
- **Refresh token: HttpOnly cookie**, backend-managed. All requests use `credentials: 'include'`.
- **Single-flight refresh.** A 401 storm (e.g. dashboard renders 8 widgets that all 401 at once) fires exactly one `POST /api/auth/refresh`, not 8. Verified by test.
- **No retry-loop.** Retry requests skip the refresh path so a stale refresh token can't trigger infinite recursion.
- **Hard logout on refresh failure.** `onAuthLost` clears session and surfaces the original `ApiError`.
- **`?next=` is URL-encoded** when building redirect paths.

## Acceptance Criteria (from §4.3)

- [x] `/login` accepts email+password, shows inline Zod errors, calls `POST /api/auth/login`
- [x] Successful login redirects to `/dashboard` (or `?next=`)
- [x] `/signup` (registered as `/register` per analysis doc) mirrors login
- [x] Refreshing `/dashboard` keeps user logged in (refresh-on-hydrate)
- [x] Logout clears state, clears query cache, redirects to `/login`
- [x] Visiting `/dashboard` while logged out → `/login?next=/dashboard`
- [x] Visiting `/login` while logged in → `/dashboard`
- [x] 401 from any API call triggers single-flight refresh + retry once
- [x] If refresh fails → hard logout
- [x] Toaster surfaces network errors
- [x] Sidebar shows nav items; stubs are visually disabled with "Soon" badge

## Known Items

### ⚠️ Push to GitHub still requires auth (same as Phase 0)
- SSH keys present at `~/.ssh/id_ed25519` but **not registered with GitHub** (`ssh -T git@github.com` → "Permission denied (publickey)")
- `gh` CLI not installed
- Commit + tag exist locally. To push:
  ```bash
  # Option 1: add SSH key to GitHub (https://github.com/settings/keys)
  cat ~/.ssh/id_ed25519.pub  # paste into GitHub
  git -C ~/Desktop/day1-rebuild/day1-frontend remote set-url origin git@github.com:DaneBennettWalter/day1-frontend.git
  git -C ~/Desktop/day1-rebuild/day1-frontend push -u origin main
  git -C ~/Desktop/day1-rebuild/day1-frontend push --tags

  # Option 2: install gh and auth
  # Option 3: personal access token via https remote
  ```

### Open backend questions (from §4.6 of plan)
- [ ] Confirm auth scheme (Bearer vs cookie). Implemented assumption: **Bearer access in memory + HttpOnly refresh cookie**. Easy pivot if wrong.
- [ ] Confirm `GET /api/auth/me` shape. Implemented but not used yet (hydration uses refresh-only).
- [ ] Confirm signup is open vs invite-only. Currently open.

### Deferred to later phases
- Playwright E2E (per plan §4.4 — requires staging backend + seeded test user)
- Sentry wiring (ErrorBoundary stub ready)
- Web Vitals reporting
- `<TopBar>` user menu (dropdown) — current implementation is a flat logout button

## Tech Added

```
dependencies:
+ @hookform/resolvers ^5.2.2
+ @tanstack/react-query ^5.100.10
+ react-hook-form ^7.75.0
+ sonner ^2.0.7
+ zod ^4.4.3
+ zustand ^5.0.13

devDependencies:
+ @testing-library/jest-dom ^6.9.1
+ @testing-library/react ^16.3.2
+ @testing-library/user-event ^14.6.1
+ @types/node ^25.7.0
+ @vitest/ui ^2.1.9
+ jsdom ^29.1.1
+ vitest ^2.1.9
```

## Next Phase

Ready for **Phase 2: Settings + API key surface** per `03-implementation-plan.md` §5.
