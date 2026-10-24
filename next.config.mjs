/** @type {import('next').NextConfig} */

import { SITE_ORIGIN, buildCsp } from "./lib/csp.mjs"

const isDev = process.env.NODE_ENV === "development"

// The same on every route.
const securityHeaders = [
  { key: "Content-Security-Policy", value: buildCsp({ isDev }) },
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
  // `Access-Control-Allow-Origin: *`. Pinning our own origin is a no-op same-origin — it exists to
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
  // Self-hosted on Carrel: `node server.js` from .next/standalone.
  output: "standalone",
  images: {
    // Nothing currently renders a gravatar through next/image — avatars are
    // radix <img> tags — so this only pre-authorises a future switch. It is not
    // what makes the CSP's img-src entry necessary.
    remotePatterns: [{ hostname: "gravatar.com" }],
  },
  // winlab.tw (apex) points at the same machine; send it to www.
  // 307 like Vercel did, so a rollback is not stuck in browser caches.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "winlab.tw" }],
        destination: "https://www.winlab.tw/:path*",
        permanent: false,
      },
      // The member directory moved to the portal on 2026-10-24.
      ...["/directory", "/directory/:path*", "/login"].map((source) => ({
        source,
        destination: "https://portal.winlab.tw/members",
        permanent: true,
      })),
    ]
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
