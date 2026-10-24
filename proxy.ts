import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { buildCsp } from "@/lib/csp.mjs"
import { publicOrigin } from "@/lib/origin"

export async function proxy(request: NextRequest) {
  // /directory is the only route that renders PII, and it is already
  // force-dynamic — so unlike the statically prerendered marketing pages it can
  // carry a per-request nonce for free. See lib/csp.mjs.
  const nonce = btoa(crypto.randomUUID())
  const csp = buildCsp({
    isDev: process.env.NODE_ENV === "development",
    nonce,
  })

  const requestHeaders = new Headers(request.headers)
  // Next.js reads this *request* header and stamps the nonce onto every script
  // tag it renders itself, including the inline RSC payload pushes
  // (getScriptNonceFromHeader, next/dist/server/app-render). Setting only the
  // response header would leave those scripts un-nonced and blank the page.
  requestHeaders.set("content-security-policy", csp)
  // app/layout.tsx reads this to nonce the two inline scripts Next does not
  // own: next-themes' pre-paint theme script and the JSON-LD block.
  requestHeaders.set("x-nonce", nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set("Content-Security-Policy", csp)

  // A fast first gate: no session cookie, straight to /login. The page still
  // checks the session itself; a cookie alone proves nothing.
  if (!getSessionCookie(request, { cookiePrefix: "www" })) {
    const loginUrl = new URL("/login", publicOrigin(request))
    loginUrl.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ["/directory/:path*"],
}
