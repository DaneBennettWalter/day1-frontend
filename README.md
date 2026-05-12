# Day 1 Frontend

Professional-grade React + TypeScript + Vite scaffold built for production.

## Tech Stack

- **Framework**: React 18.3
- **Language**: TypeScript 5.4 (strict mode)
- **Build Tool**: Vite 5.2
- **Styling**: Tailwind CSS 3.4 + PostCSS
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router 6.22
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

## License

Private repository. All rights reserved.

## Support

For issues or questions, contact the development team or open a GitHub issue.
