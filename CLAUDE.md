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

Single-page lab website: Hero → About → Research → Professor → Members → Find the Lab.

### Three-layer data pattern (Supabase UI style)

```
lib/services/   → business logic, Keycloak queries (no React)
hooks/          → React state wrappers (useInView)
components/     → pure presentation, receives data via props/hooks
app/api/        → Next.js route handlers bridging client ↔ service
```

Data flow for Members: `Keycloak → lib/keycloak.ts → lib/services/users.ts (getPublicUsers) → app/page.tsx (server component) → components/users/members.tsx → user-grid.tsx`

- `app/page.tsx` is `force-static` with `revalidate = 3600` (ISR). Members are in the SSR HTML; the page regenerates in the background at most once an hour. `force-static` is required because the Keycloak admin client sends an Authorization header, which Next would otherwise treat as a dynamic signal.
- Gravatar existence is resolved server-side in `lib/services/users.ts` (one HEAD per email, memoised 24h). `gravatarUrl` is only set when an image exists, so the browser never fires a known-404 request and the email MD5 is never exposed for members without an avatar.
- `/api/users` serves the same `PublicUser` projection for any external consumer. Nothing in this app fetches it any more.
- CI builds without Keycloak env: `hasKeycloakConfig()` short-circuits to an empty list so the build still passes.

### Research section

`components/research.tsx` holds `RESEARCH_AREAS`, sourced from Prof. Tseng's Google Site (research interests + project list). Keep `components/json-ld.tsx`'s `knowsAbout` in step when editing it.

### Hero ASCII art system

`lib/hero-data.json` contains a 47×36 grid of characters with RGB colors, parsed from an SVG. `components/hero.tsx` renders this on a canvas with `requestAnimationFrame`:
- Wave: sin-based character density oscillation
- Mouse: cross-shaped proximity influence (120px radius)
- Glitch: rare random character swap held for ~0.5s
- Charset density scale: `.:-=+*#%@`

### Animations

Scroll-triggered sections use `motion/react-m` (`import * as m from "motion/react-m"`) with consistent spring config: `{ type: "spring", stiffness: 200, damping: 20 }`, triggered via `hooks/use-in-view.ts` (IntersectionObserver, fires once). `components/page-transition.tsx` wraps the app in `<LazyMotion features={domAnimation} strict>`, so importing `motion` from `motion/react` anywhere throws at runtime: always use `m.*`.

Header, footer and uptime use the CSS `animate-fade-in` class from `globals.css` instead of motion, so the header text (the LCP element) paints before hydration.

### Map embed

`components/find-us.tsx` mounts the Google Maps iframe only after the visitor clicks "Load interactive map". The embed costs about 450 KiB of script, more than the rest of the page.

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
