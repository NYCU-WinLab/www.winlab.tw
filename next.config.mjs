/** @type {import('next').NextConfig} */

import { SITE_ORIGIN, buildCsp } from "./lib/csp.mjs"

const isDev = process.env.NODE_ENV === "development"

// Everything except the CSP. These are identical on every route, /directory
// included, so they stay on a single catch-all entry.
const baseSecurityHeaders = [
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
    // what makes the CSP's img-src entry necessary.
    remotePatterns: [
      { hostname: "gravatar.com" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: baseSecurityHeaders },
      {
        // /directory is excluded on purpose: proxy.ts sets a stricter,
        // per-request nonce CSP there. Matching it here too would leave the
        // response carrying two CSP headers, which browsers enforce as an
        // intersection — it would still be safe, but it makes the effective
        // policy something you have to derive rather than read.
        source: "/:path((?!directory$|directory/).*)",
        headers: [
          { key: "Content-Security-Policy", value: buildCsp({ isDev }) },
        ],
      },
    ]
  },
}

export default nextConfig
