/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development"

// Kept in sync by hand with app/layout.tsx's metadataBase and app/sitemap.ts —
// they are three independent string literals and nothing enforces the coupling.
const SITE_ORIGIN = "https://www.winlab.tw"

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` in script-src is deliberate, not an oversight. The App
 * Router streams its RSC payload through inline
 * `<script>self.__next_f.push(...)</script>` tags whose contents change every
 * build (and per request on dynamic routes like /directory), and next-themes
 * injects a render-blocking inline script to set the theme class before paint —
 * neither has a hash we can pin at build time. The only stricter option is a
 * per-request nonce, which requires generating it in `proxy.ts` for every route
 * and therefore opting every page out of static prerendering. This site is
 * served almost entirely from the Vercel edge cache today, so that trade is not
 * worth it here.
 *
 * Be clear-eyed about what this costs: with no nonce or hash, `'unsafe-inline'`
 * means CSP provides no XSS mitigation for injected inline script. What the
 * remaining directives still buy is blocking *external* script injection,
 * framing, and form exfiltration — which is what the audit finding was about.
 * Tightening /directory (the one route with PII, and already force-dynamic, so
 * a nonce there costs nothing) is tracked separately.
 *
 * Dev-only relaxations: Turbopack's React Refresh runtime uses `eval`, and the
 * HMR client opens a websocket back to the dev server.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Not Tailwind — v4 compiles arbitrary values into stylesheet classes, and
  // the build emits no inline <style> at all. The inline style *attributes*
  // come from motion/react's per-frame transform/opacity, next/image's
  // style="color:transparent", and the map iframe at find-us.tsx. Drop this and
  // every animation breaks.
  "style-src 'self' 'unsafe-inline'",
  // Avatars are radix <img> tags hitting lib/services/users.ts's
  // https://gravatar.com/avatar/... URL directly, not next/image. Without the
  // host every avatar silently degrades to its initials fallback. Host matching
  // is exact — moving to www.gravatar.com would need this updated too.
  "img-src 'self' data: https://gravatar.com",
  // next/font/google self-hosts Geist Mono at build time.
  "font-src 'self'",
  // If lib/supabase/client.ts's browser client ever gains an importer (today it
  // has none — every Supabase call is server-side), the Supabase project origin
  // has to be added here or its requests fail with nothing but a console
  // violation to go on.
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  // The "Find the Lab" section embeds a Google Maps place iframe. As of
  // 2026-08, EEA/UK/CH visitors without Google consent cookies are bounced
  // through consent.google.com on the way in, and CSP re-checks frame-src on
  // every redirect hop — so the consent host has to be listed or the map comes
  // up blank for them. Not reproducible from TW: if this looks like dead
  // config, check the redirect chain from an EEA egress before removing it.
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

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Legacy companion to frame-ancestors, which shipped in CSP Level 2 — this
  // only matters for browsers older than that.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Nothing here is meant to be read cross-origin. As of 2026-08 an org-wide
  // grep found no other winlab app fetching assets from this origin, and
  // Vercel's own default on statically served responses was a blanket
  // `Access-Control-Allow-Origin: *` (dynamic routes like /api/users got no
  // ACAO at all). Pinning our own origin is a no-op same-origin — it exists to
  // stop `*` from silently covering some future endpoint. If another winlab app
  // ever does need to fetch from here, this and the CORP header below are what
  // will be blocking it.
  { key: "Access-Control-Allow-Origin", value: SITE_ORIGIN },
  // CORP is the directive that actually enforces this: unlike ACAO (which only
  // gates script-initiated reads), it also blocks other origins from embedding
  // these responses as subresources.
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
]

const nextConfig = {
  images: {
    // Nothing currently renders a gravatar through next/image — avatars are
    // radix <img> tags — so this only pre-authorises a future switch. It is not
    // what makes the CSP's img-src entry above necessary.
    remotePatterns: [
      { hostname: "gravatar.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
