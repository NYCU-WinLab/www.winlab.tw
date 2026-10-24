/**
 * The Content-Security-Policy, applied to every route by next.config.mjs.
 * Every page is statically prerendered and its inline scripts (the App
 * Router's RSC payload, next-themes' pre-paint theme script) have no
 * build-time hash, so script-src needs `'unsafe-inline'`.
 *
 * This file is .mjs rather than .ts so that next.config.mjs can import it.
 */

/**
 * Kept in sync by hand with app/layout.tsx's metadataBase and app/sitemap.ts —
 * they are independent string literals and nothing enforces the coupling.
 */
export const SITE_ORIGIN = "https://www.winlab.tw"

/**
 * @param {{ isDev?: boolean }} [options]
 * @returns {string} a serialized CSP header value
 */
export function buildCsp({ isDev = false } = {}) {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    // motion/react animates by writing inline transform/opacity attributes
    // on every frame. next/image's
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
