# Day 1 Frontend

Professional-grade React + TypeScript + Vite scaffold built for production.

## Tech Stack

- **Framework**: React 18.3
- **Language**: TypeScript 5.4 (strict mode)
- **Build Tool**: Vite 5.2
- **Styling**: Tailwind CSS 3.4 + PostCSS
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router 6.22
- **Server state**: TanStack Query 5
- **Client state**: Zustand 5
- **Forms**: React Hook Form + Zod
- **Notifications**: sonner
- **Testing**: Vitest 2 + React Testing Library + jsdom
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Prettier + husky + lint-staged
- **CI/CD**: GitHub Actions

## Setup Instructions

### Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/DaneBennettWalter/day1-frontend.git
cd day1-frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

## Auth Flow

Day 1 uses **Bearer JWT in memory + HttpOnly refresh cookie** (default assumption from `02-architecture.md` §6.1, pending backend confirmation).

### Sequence

```
Browser              React (Zustand + api client)          Backend API
   │                          │                                │
   │  submit /login           │                                │
   │─────────────────────────►│                                │
   │                          │  POST /api/auth/login          │
   │                          │───────────────────────────────►│
   │                          │  { user, accessToken }         │
   │                          │  Set-Cookie: refresh=...;HttpOnly
   │                          │◄───────────────────────────────│
   │                          │  store.setSession(...)         │
   │                          │  navigate → /dashboard         │
   │                          │                                │
   │  (page reload)           │                                │
   │─────────────────────────►│  main.tsx → store.hydrate()    │
   │                          │  POST /api/auth/refresh        │
   │                          │  (cookie sent via credentials) │
   │                          │───────────────────────────────►│
   │                          │  { user, accessToken }         │
   │                          │◄───────────────────────────────│
   │                          │  status = 'authenticated'      │
   │                          │                                │
   │  (any authed call → 401) │                                │
   │                          │  → store.refresh() (single-flight)
   │                          │  → POST /api/auth/refresh      │
   │                          │  → retry original request once │
   │                          │  → if refresh fails: hard logout
```

### Rules

- **Access token lives in memory only.** Never `localStorage`, never `sessionStorage`. Lost on tab close — that's intentional; the HttpOnly refresh cookie rehydrates on next load.
- **Single-flight refresh.** Concurrent 401s share one in-flight refresh promise (`refreshPromise` in the auth store). Verified by `store.test.ts`.
- **Route guards.** `<RequireAuth>` wraps `AppShell`; renders a spinner during initial hydration so we never flash unauthenticated UI to a user with a valid refresh cookie. `<RedirectIfAuthed>` keeps signed-in users out of `/login` and `/register`.
- **Logout is best-effort.** `POST /api/auth/logout` is fired but we don't block on it. State + query cache are cleared locally, then we redirect to `/login`.
- **`?next=` honored.** `/login?next=/dashboard` lands you on `/dashboard` after success.

### Files

```
src/
├─ lib/
│  ├─ api/
│  │  ├─ client.ts        # request<T>(), single-flight 401 retry
│  │  ├─ errors.ts        # ApiError
│  │  └─ endpoints.ts     # endpoint string constants
│  ├─ env.ts              # Zod-validated env
│  └─ query.ts            # TanStack Query client
├─ features/auth/
│  ├─ api.ts              # login, register, logout, me, refresh
│  ├─ store.ts            # Zustand: user, accessToken, status, single-flight refresh
│  ├─ hooks.ts            # useAuth, useLogin, useRegister, useLogout
│  ├─ guards.tsx          # <RequireAuth>, <RedirectIfAuthed>
│  ├─ schemas.ts          # Zod login/register form schemas
│  └─ types.ts
├─ features/dashboard/
│  └─ DashboardPage.tsx   # placeholder (widgets in P7)
├─ components/
│  ├─ layout/             # AppShell, MarketingShell, Sidebar, TopBar
│  └─ feedback/           # FullPageSpinner, Toaster, ErrorBoundary
└─ routes/
   ├─ login.tsx
   ├─ register.tsx
   └─ comingSoon.tsx
```

## Development Commands

```bash
# Start dev server with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Type checking
pnpm type-check

# Linting
pnpm lint          # Check for issues
pnpm lint:fix      # Auto-fix issues

# Formatting
pnpm format        # Format all files
pnpm format:check  # Check formatting
```

## Project Structure

```
day1-frontend/
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI pipeline
├── src/
│   ├── components/          # Shared UI components (shadcn/ui)
│   ├── features/            # Feature modules (empty for now)
│   ├── lib/                 # Utility functions
│   │   └── utils.ts         # cn() helper for class merging
│   ├── routes/              # Route definitions
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles + Tailwind + CSS variables
│   └── vite-env.d.ts        # Vite type definitions
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration (strict mode)
├── tsconfig.node.json       # TypeScript config for Node scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── .eslintrc.cjs            # ESLint configuration
├── .prettierrc              # Prettier configuration
├── package.json             # Project dependencies and scripts
└── README.md                # This file
```

## Architecture Decisions

### 1. **Vite over Create React App**

- Faster development server with HMR
- Superior build performance
- Modern ES modules first approach
- Better TypeScript integration

### 2. **TypeScript Strict Mode**

- Enabled all strict compiler options
- `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `noUncheckedIndexedAccess` for safer array access
- `noImplicitReturns` for explicit function returns

### 3. **pnpm as Package Manager**

- Faster than npm/yarn
- Efficient disk space usage with content-addressable store
- Strict dependency resolution prevents phantom dependencies

### 4. **shadcn/ui Component System**

- Copy-paste components (not npm package)
- Full control over component code
- Built on Radix UI primitives (accessibility first)
- Tailwind CSS styling with CSS variables for theming

### 5. **Path Aliases**

- `@/` maps to `./src/`
- Cleaner imports: `import { Button } from '@/components/ui/button'`
- Configured in both `vite.config.ts` and `tsconfig.json`

### 6. **Git Hooks**

- husky for pre-commit hooks
- lint-staged for running linters on staged files only
- Ensures code quality before commits

### 7. **Feature-Based Structure**

- `features/` directory for domain-specific modules
- Each feature contains its own components, hooks, and logic
- Promotes modularity and scalability

## Code Quality

### Linting

ESLint is configured with:

- `eslint:recommended`
- `@typescript-eslint/recommended` + `recommended-requiring-type-checking`
- `plugin:react/recommended` + `plugin:react-hooks/recommended`
- `prettier` (to avoid conflicts)

### Formatting

Prettier is configured with:

- No semicolons
- Single quotes
- 2 space indentation
- Trailing commas (ES5)
- 80 character line width

### Pre-commit Hooks

Git hooks automatically run on commit:

1. Type check (`tsc --noEmit`)
2. Lint staged files (`eslint --fix`)
3. Format staged files (`prettier --write`)

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR to `main`:

1. **Install dependencies** (with pnpm cache)
2. **Type check** (`pnpm type-check`)
3. **Lint** (`pnpm lint`)
4. **Format check** (`pnpm format:check`)
5. **Build** (`pnpm build`)

All checks must pass before merging PRs.

## Deployment

### Build

```bash
pnpm build
```

Outputs optimized production build to `dist/` directory.

### Preview Locally

```bash
pnpm preview
```

Serves the production build locally for testing.

### Deploy to Production

The `dist/` directory can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **GitHub Pages**: Use GitHub Actions with `actions/deploy-pages`
- **AWS S3**: `aws s3 sync dist/ s3://your-bucket --delete`
- **Cloudflare Pages**: Connect GitHub repo in Cloudflare dashboard

#### Recommended: Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

Vercel automatically detects Vite projects and configures build settings.

## Adding shadcn/ui Components

shadcn/ui components are added via CLI (not installed as a package):

```bash
# Example: Add Button component
npx shadcn-ui@latest add button

# Example: Add Dialog component
npx shadcn-ui@latest add dialog
```

Components are copied to `src/components/ui/` where you can modify them.

## Environment Variables

Create `.env` files for environment-specific variables:

```bash
# .env.local (git-ignored)
VITE_API_URL=https://api.example.com
VITE_API_KEY=your_api_key_here
```

Access in code via `import.meta.env.VITE_API_URL`.

**Note**: Only variables prefixed with `VITE_` are exposed to the client.

## Browser Support

- Modern browsers with ES2020 support
- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## Feature Status

### ✅ Phase 1: Auth + Dashboard Shell (v0.2.0)

- Complete authentication flow (login, register, logout, refresh)
- Protected routes with guards
- Empty dashboard shell
- Sidebar navigation with placeholder links

### ✅ Phase 2: Settings + API Key Management (v0.3.0)

**Settings feature with 4 tabs:**

1. **General** - Organization name, description, address, phone, email, EIN
2. **AI** - API key input, health check status badge, secure key storage
3. **Branding** - Theme toggle (light/dark/system), primary/accent color pickers, logo URL
4. **Team** - Read-only placeholder (coming soon)

**Features:**

- Tab-based settings navigation
- Form validation with Zod schemas
- Optimistic updates for fast UX
- Theme changes apply immediately
- Color changes apply immediately for preview
- AI health check shows "AI Active ✓" when API key is configured
- API keys never stored client-side (encrypted server-side only)
- Comprehensive validation tests

**Endpoints used:**

- `GET /api/org/default/settings` - Fetch settings
- `PUT /api/org/default/settings` - Update settings
- `GET /api/health` - Check AI availability
- `POST /api/settings/api-keys` - Save API key

### 🔜 Phase 3: AI Chat (Standalone)

Standalone AI chat interface proving the backend proxy integration before document editor work.

### 🔜 Phase 4: Documents

Document lifecycle with AI generation, editor, and print preview.

## License

Private repository. All rights reserved.

## Support

For issues or questions, contact the development team or open a GitHub issue.
