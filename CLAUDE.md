# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # dev server (Turbopack)
bun run build    # production build
bun run lint     # ESLint
bun run typecheck # tsc --noEmit
bun run format   # Prettier
```

Add shadcn components: `bunx shadcn@latest add <component>`

## Architecture

Single-page lab website: Hero → About → Professor → Members → Find the Lab.

### Three-layer data pattern (Supabase UI style)

```
lib/services/   → business logic, Keycloak queries (no React)
hooks/          → React state wrappers (useUsers, useInView)
components/     → pure presentation, receives data via props/hooks
app/api/        → Next.js route handlers bridging client ↔ service
```

Data flow for Members: `Keycloak → lib/keycloak.ts → lib/services/users.ts → app/api/users/route.ts → hooks/use-users.ts → components/users/user-grid.tsx`

### Hero ASCII art system

`lib/hero-data.json` contains a 47×36 grid of characters with RGB colors, parsed from an SVG. `components/hero.tsx` renders this on a canvas with `requestAnimationFrame`:
- Wave: sin-based character density oscillation
- Mouse: cross-shaped proximity influence (120px radius)
- Glitch: rare random character swap held for ~0.5s
- Charset density scale: `.:-=+*#%@`

### Animations

All animations use `motion/react` with consistent spring config: `{ type: "spring", stiffness: 200, damping: 20 }`. Scroll-triggered via `hooks/use-in-view.ts` (IntersectionObserver, fires once).

### Theming

`next-themes` with `class` attribute strategy. Default: dark. Press `d` to toggle. Canvas hero reads background color from `getComputedStyle` to match theme. Light mode darkens ASCII art colors: `r*0.3, g*0.3, b*0.7`.

## Conventions

- Prettier: no semicolons, double quotes, 2-space indent, trailing comma es5
- Tailwind CSS v4 with oklch color variables
- shadcn/ui components in `components/ui/`, app components in `components/`
- Keycloak user attributes are flattened from `Record<string, string[]>` to `Record<string, string | undefined>` in the service layer
- Users filtered by `enabled: true` and grouped by `admissionYear` attribute (descending)

## Environment

Requires `.env.local` — see `.env.example`. Keycloak client needs `client_credentials` grant with `view-users` role.
