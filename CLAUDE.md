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

Add components from the WinLab registry: `bunx shadcn@latest add @winlab/<name> -o`. `bun run tokens:check` and `bun run format:check` run in CI.

## Architecture

Single-page lab website: Hero → About → Research → Professor → Members → Find the Lab. Nothing else: member tools live on portal.winlab.tw.

### Three-layer data pattern

```
lib/services/   → business logic, Keycloak queries (no React)
components/     → pure presentation, receives data via props/hooks
```

Data flow for Members: `Keycloak → lib/keycloak.ts → lib/services/users.ts (getPublicUsers) → app/page.tsx (server component) → components/users/members.tsx → user-grid.tsx`

- `app/page.tsx` is `force-static` with `revalidate = 3600` (ISR). Members are in the SSR HTML; the page regenerates in the background at most once an hour. `force-static` is required because the Keycloak admin client sends an Authorization header, which Next would otherwise treat as a dynamic signal.
- Gravatar existence is resolved server-side in `lib/services/users.ts` (one HEAD per email, memoised 24h). `gravatarUrl` is only set when an image exists, so the browser never fires a known-404 request and the email MD5 is never exposed for members without an avatar.
- CI builds without Keycloak env: `hasKeycloakConfig()` short-circuits to an empty list so the build still passes.

### No sign-in

The site has no sign-in and no runtime secrets beyond the Keycloak admin client the home page reads. The member directory lives on the portal (`portal.winlab.tw/members`); `next.config.mjs` sends `/directory` and `/login` there with a 308.

### Research section

`components/research.tsx` holds `RESEARCH_AREAS`, sourced from Prof. Tseng's Google Site (research interests + project list). Keep `components/json-ld.tsx`'s `knowsAbout` in step when editing it.

### Hero ASCII art system

`lib/hero-data.json` contains a 47×36 grid of characters with RGB colors, parsed from an SVG. `components/hero.tsx` renders this on a canvas with `requestAnimationFrame`:
- Wave: sin-based character density oscillation
- Mouse: cross-shaped proximity influence (120px radius)
- Glitch: rare random character swap held for ~0.5s
- Charset density scale: `.:-=+*#%@`

### Design

The site follows ui.winlab.tw (its DESIGN.md is the rulebook): `app-shell` corners (breadcrumb top left, Members and Portal top right, build commit bottom left, © bottom right), `text-title` and `text-body` only, no cards, `section` blocks with a divider. About is the page's one `focus`; lists arrive with `stagger-rise`. The hero bleeds out of the shell's padding to fill the first screen. `tokens:check` exempts `components/hero.tsx` (canvas colors) and `app/opengraph-image.tsx` (next/og needs inline styles).

### Map embed

`components/find-us.tsx` mounts the Google Maps iframe only after the visitor clicks "Show map". The embed costs about 450 KiB of script, more than the rest of the page.

### Theming

The theme follows the system (`components/theme-provider.tsx`); D switches it. Canvas hero reads background color from `getComputedStyle` to match theme. Light mode darkens ASCII art colors: `r*0.3, g*0.3, b*0.7`.

## Conventions

- Prettier: no semicolons, double quotes, 2-space indent, trailing comma es5
- Tailwind CSS v4 with oklch color variables
- WinLab registry components in `components/ui/` and blocks in `components/`; app components next to them
- Keycloak user attributes are flattened from `Record<string, string[]>` to `Record<string, string | undefined>` in the service layer
- Users filtered by `enabled: true`, minus test accounts (a `test` token in the username, `isListed` in `lib/services/users.ts`), and grouped by `admissionYear` attribute (descending)

## Environment

Requires `.env.local` — see `.env.example`. Keycloak client needs `client_credentials` grant with `view-users` role.

## Deploy

Runs on the Carrel machine `www` (tenant `winfra`) as a Next.js standalone server (`node server.js`, port 3000). `winlab.tw` points at the same machine and `next.config.mjs` redirects it to `www.winlab.tw`.

- Every push to `main` runs `.github/workflows/carrel.yml`: it builds with the Keycloak repo secrets (the home page is prerendered with members), packs `.next/standalone` and ships it with `NYCU-WinLab/carrel-deploy`.
- `carrel-deployd` on the machine switches the release and rolls back if `http://127.0.0.1:3000/` is unhealthy. Roll back by hand with the Carrel `app_rollback` tool.
- Runtime secrets live in `/srv/apps/www/env` on the machine.
- The build passes `NEXT_PUBLIC_BUILD_SHA`, `NEXT_PUBLIC_BUILD_TIME` and `NEXT_PUBLIC_BUILD_URL` for the bottom-left corner.
