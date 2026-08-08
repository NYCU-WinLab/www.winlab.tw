/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development"

// Hardcoded to match the canonical origin already baked into
// app/layout.tsx's metadataBase and app/sitemap.ts.
const SITE_ORIGIN = "https://www.winlab.tw"

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` in script-src is deliberate, not an oversight. The App
 * Router streams its RSC payload through per-request inline
 * `<script>self.__next_f.push(...)</script>` tags, and next-themes injects a
 * render-blocking inline script to set the theme class before paint — neither
 * has a hash we can pin at build time. The only stricter option is a
 * per-request nonce, which requires generating it in `proxy.ts` for every
 * route and therefore opting every page out of static prerendering. This site
 * is served almost entirely from the Vercel edge cache today, so that trade is
 * not worth it: the remaining directives still block *external* script
 * injection, framing, and form exfiltration, which is what the audit finding
 * was about.
 *
 * Dev-only relaxations: Turbopack's React Refresh runtime uses `eval`, and the
 * HMR client opens a websocket back to the dev server.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // motion/react and Tailwind's arbitrary values write inline style attributes.
  "style-src 'self' 'unsafe-inline'",
  // Avatars are radix <img> tags pointing straight at gravatar.com — they do
  // not go through next/image, so 'self' alone would blank out every member.
  "img-src 'self' data: https://gravatar.com",
  // next/font/google self-hosts Geist Mono at build time.
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  // The "Find the Lab" section embeds a Google Maps place iframe.
  "frame-src https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Legacy companion to frame-ancestors, for browsers that predate CSP3.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Vercel serves prerendered HTML and public/ assets with a blanket
  // `Access-Control-Allow-Origin: *` (dynamic routes like /api/users get no
  // ACAO at all). Nothing on this site is meant to be read cross-origin, and
  // an org-wide code search found no other winlab app fetching assets from
  // here, so we narrow the grant to our own origin — a no-op for same-origin
  // loads, but it stops `*` from silently covering some future endpoint.
  { key: "Access-Control-Allow-Origin", value: SITE_ORIGIN },
  // CORP is the directive that actually enforces this: unlike ACAO (which only
  // gates script-initiated reads), it also blocks other origins from embedding
  // these responses as subresources.
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
]

const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "gravatar.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
