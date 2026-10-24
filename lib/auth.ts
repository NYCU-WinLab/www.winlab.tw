import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { genericOAuth } from "better-auth/plugins"
import { SITE_ORIGIN } from "@/lib/csp.mjs"
import { getKeycloakAdmin } from "@/lib/keycloak"

/**
 * Sign-in for /directory: Keycloak (auth.winlab.tw, realm winlab) is the only
 * way in. There is no database. The session lives in an encrypted cookie
 * (Better Auth's stateless mode), so signing in stores nothing on the server.
 * It lasts 7 days and is not refreshed: /directory is a server component and
 * cannot rewrite cookies, and Keycloak's own session makes signing in again
 * one click. A cookie cannot be revoked, so getMember() also asks Keycloak
 * on every visit whether the account is still enabled.
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
  disabledPaths: ["/update-user", "/change-email"],
  session: {
    expiresIn: 7 * 24 * 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
      strategy: "jwe",
      // Stateless mode turns this on by default; see the comment above.
      refreshCache: false,
    },
  },
  account: { storeStateStrategy: "cookie", storeAccountCookie: true },
  advanced: { cookiePrefix: "www" },
  user: {
    additionalFields: {
      // Keycloak `sub`: the account getMember() checks on every visit.
      // Not input: false, which also drops it from the mapped profile;
      // /update-user is disabled instead so a member cannot rewrite it.
      keycloakId: { type: "string", required: false },
    },
  },
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
              mapProfileToUser: (profile) => ({
                keycloakId: String(profile.sub ?? profile.id ?? ""),
              }),
              overrideUserInfo: true,
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

/**
 * The signed-in member whose Keycloak account is still enabled, or null.
 * Use this, not getSession(), in front of member data.
 */
export async function getMember(headers: Headers) {
  const session = await getSession(headers)
  const id = (session?.user as { keycloakId?: string } | undefined)?.keycloakId
  if (!session || !id) return null
  try {
    const kc = await getKeycloakAdmin()
    const user = await kc.users.findOne({
      realm: process.env.KEYCLOAK_REALM!,
      id,
    })
    return user?.enabled ? session : null
  } catch {
    return null
  }
}
