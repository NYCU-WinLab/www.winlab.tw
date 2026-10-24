import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { genericOAuth } from "better-auth/plugins"
import { SITE_ORIGIN } from "@/lib/csp.mjs"

/**
 * Sign-in for /directory: Keycloak (auth.winlab.tw, realm winlab) is the only
 * way in. There is no database. The session lives in an encrypted cookie
 * (Better Auth's stateless mode), so signing in stores nothing on the server.
 * It lasts 7 days and is not refreshed: /directory is a server component and
 * cannot rewrite cookies, and Keycloak's own session makes signing in again
 * one click.
 */

const issuer = process.env.KEYCLOAK_ISSUER
const clientId = process.env.KEYCLOAK_CLIENT_ID
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET

/** False in CI and in local dev without env: /directory then stays locked. */
export function hasAuthConfig() {
  return Boolean(
    issuer && clientId && clientSecret && process.env.BETTER_AUTH_SECRET
  )
}

export const auth = betterAuth({
  // Behind the Carrel gateway `request.url` is the bind address, so the
  // public origin is pinned, as in lib/origin.ts.
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : SITE_ORIGIN,
  // next build imports this module to collect routes, without runtime env;
  // only that phase gets a placeholder. At run time a missing secret throws.
  secret:
    process.env.BETTER_AUTH_SECRET ??
    (process.env.NEXT_PHASE === "phase-production-build"
      ? "build-time-placeholder-never-used-to-sign"
      : undefined),
  emailAndPassword: { enabled: false },
  session: {
    expiresIn: 7 * 24 * 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
      strategy: "jwe",
    },
  },
  account: { storeStateStrategy: "cookie", storeAccountCookie: true },
  advanced: { cookiePrefix: "www" },
  plugins: [
    genericOAuth({
      config: hasAuthConfig()
        ? [
            {
              providerId: "keycloak",
              clientId: clientId!,
              clientSecret: clientSecret!,
              discoveryUrl: `${issuer}/.well-known/openid-configuration`,
              // Keycloak 22+ rejects more; profile and email come back anyway.
              scopes: ["openid"],
              pkce: true,
              requireIdTokenVerification: true,
            },
          ]
        : [],
    }),
    nextCookies(),
  ],
})

/** The signed-in member, or null. Never throws. */
export async function getSession(headers: Headers) {
  if (!hasAuthConfig()) return null
  try {
    return await auth.api.getSession({ headers })
  } catch {
    return null
  }
}
