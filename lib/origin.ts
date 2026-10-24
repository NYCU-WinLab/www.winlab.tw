import { SITE_ORIGIN } from "@/lib/csp.mjs"

/**
 * Origin for absolute redirects. Behind the Carrel gateway the standalone
 * server sees its own bind address in `request.url` (`http://0.0.0.0:3000`),
 * so production pins the public origin. `next dev` keeps the request's own.
 */
export function publicOrigin(request: Request): string {
  return process.env.NODE_ENV === "development"
    ? new URL(request.url).origin
    : SITE_ORIGIN
}
