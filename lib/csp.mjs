/**
 * Single source of truth for the Content-Security-Policy.
 *
 * Two callers, two policies built from the same directive list:
 *
 * - `next.config.mjs` builds the nonce-less policy and applies it to every
 *   route except /directory. Those routes are statically prerendered and their
 *   inline scripts (the App Router's RSC payload, next-themes' pre-paint theme
 *   script) have no build-time hash, so they need `'unsafe-inline'`.
 * - `proxy.ts` builds a per-request nonce policy for /directory, which is the
 *   only route rendering PII and is already `force-dynamic` — so a nonce there
 *   costs nothing that isn't already being paid.
 *
 * This file is .mjs rather than .ts so that next.config.mjs can import it;
 * proxy.ts reaches it through `allowJs`.
 */

/**
 * Kept in sync by hand with app/layout.tsx's metadataBase and app/sitemap.ts —
 * they are independent string literals and nothing enforces the coupling.
 */
export const SITE_ORIGIN = "https://www.winlab.tw"

/**
 * SHA-256 of next-themes' pre-paint inline script, as rendered by
 * `<ThemeProvider>` in app/layout.tsx.
 *
 * Next.js nonces the scripts it emits itself, but this one belongs to
 * next-themes, and the nonce can't reach it: the root layout would have to read
 * a request header to get it, which would drop /, /login and /_not-found out of
 * static prerendering (see the comment in app/layout.tsx). Allow-listing it by
 * hash keeps the nonce policy strict without that cost.
 *
 * The content changes if next-themes is upgraded or if ThemeProvider's props
 * change. `bun run verify:csp-hash` recomputes it from the build output and
 * fails if it has drifted — CI runs it, so this cannot rot silently. Without
 * that check the symptom would be a light-mode flash on /directory only.
 */
export const THEME_SCRIPT_HASH =
  "sha256-zjP2BXYgSCCnXNMXI2IL1yRydoQdsGR/uCCr6kyKsD0="

/**
 * @param {{ isDev?: boolean, nonce?: string }} [options]
 * @returns {string} a serialized CSP header value
 */
export function buildCsp({ isDev = false, nonce } = {}) {
  return [
    "default-src 'self'",
    // With a nonce, `'unsafe-inline'` is ignored by every browser that
    // understands nonces, so injected inline script stops executing — the
    // point of the whole exercise. `'self'` is kept alongside the nonce
    // deliberately: `'strict-dynamic'` would be stricter still, but it makes
    // `'self'` inert, so a single un-nonced <script src> would blank the page
    // instead of degrading. Given /directory can only be exercised end-to-end
    // against a deployment with real auth, the forgiving option wins here.
    nonce
      ? `script-src 'self' 'nonce-${nonce}' '${THEME_SCRIPT_HASH}'${isDev ? " 'unsafe-eval'" : ""}`
      : `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    // Deliberately NOT nonced. A nonce in style-src would disable
    // `'unsafe-inline'` for style *attributes* too (style-src-attr falls back
    // to style-src), and motion/react animates by writing inline
    // transform/opacity attributes on every frame. next/image's
    // style="color:transparent" and the map iframe do the same.
    // Not Tailwind — v4 compiles arbitrary values into stylesheet classes.
    "style-src 'self' 'unsafe-inline'",
    // Avatars are radix <img> tags hitting lib/services/users.ts's
    // https://gravatar.com/avatar/... URL directly, not next/image. Without the
    // host every avatar silently degrades to its initials fallback. Host
    // matching is exact — moving to www.gravatar.com would need this updated.
    "img-src 'self' data: https://gravatar.com",
    // next/font/google self-hosts Geist Mono at build time.
    "font-src 'self'",
    // If lib/supabase/client.ts's browser client ever gains an importer (today
    // it has none — every Supabase call is server-side), the Supabase project
    // origin has to be added here or its requests fail with nothing but a
    // console violation to go on.
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    // The "Find the Lab" section embeds a Google Maps place iframe. As of
    // 2026-08, EEA/UK/CH visitors without Google consent cookies are bounced
    // through consent.google.com on the way in, and CSP re-checks frame-src on
    // every redirect hop — so the consent host has to be listed or the map
    // comes up blank for them. Not reproducible from TW: if this looks like
    // dead config, check the redirect chain from an EEA egress before removing.
    "frame-src https://www.google.com https://consent.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    // Not applied in dev: localhost is exempt as a trustworthy origin, but
    // testing from a phone on the LAN IP would have every subresource upgraded
    // to https against a server that only speaks http.
    isDev ? null : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ")
}
