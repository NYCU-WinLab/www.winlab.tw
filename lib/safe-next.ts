import { SITE_ORIGIN } from "@/lib/csp.mjs"

/**
 * A same-site path to return to after sign-in; anything else is /directory.
 * Parsed the way a browser would, so tricks like `/\t/evil.com` (browsers
 * drop the tab and read `//evil.com`) resolve off-site and are refused.
 */
export function safeNext(raw: string | null): string {
  const fallback = "/directory"
  if (!raw || !raw.startsWith("/") || /[\x00-\x1f\x7f\\]/.test(raw)) {
    return fallback
  }
  try {
    const url = new URL(raw, SITE_ORIGIN)
    if (url.origin !== SITE_ORIGIN) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
