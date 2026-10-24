import { createHash } from "crypto"

import { getKeycloakAdmin } from "@/lib/keycloak"

export type KeycloakUser = {
  id: string
  username: string
  email?: string
  firstName?: string
  lastName?: string
  enabled: boolean
  createdTimestamp: number
  attributes: Record<string, string | undefined>
  /** Only set when Gravatar actually has an image for this email. */
  gravatarUrl?: string
}

/** The shape the public landing page exposes. No email, no hash
 *  for members without an avatar: the MD5 in a Gravatar URL is reversible
 *  against a known address pattern, so it is only sent when it buys something. */
export type PublicUser = {
  id: string
  displayName: string
  gravatarUrl?: string
  admissionYear?: string
}

const USERS_CACHE_TTL_MS = 5 * 60 * 1000

let usersCache:
  | {
      expiresAt: number
      users: KeycloakUser[]
    }
  | undefined

/**
 * Gravatar existence is resolved server-side so the browser never fires a
 * request that is known to 404. Before this, the landing page issued one
 * `d=404` request per member (263 at the time, 163 of them 404s) and that
 * alone was the largest cost in the mobile Lighthouse run.
 *
 * Results are memoised per hash for a day. A miss costs one HEAD request; a
 * network failure or non-200/404 status is not cached, so it is retried on the
 * next refresh rather than hiding an avatar for 24 hours.
 */
const GRAVATAR_CACHE_TTL_MS = 24 * 60 * 60 * 1000
const GRAVATAR_CONCURRENCY = 16
const GRAVATAR_TIMEOUT_MS = 5000

const gravatarCache = new Map<string, { exists: boolean; expiresAt: number }>()

function gravatarHash(email: string) {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex")
}

function gravatarUrlFor(hash: string) {
  return `https://gravatar.com/avatar/${hash}?d=404&s=160`
}

async function gravatarExists(hash: string): Promise<boolean | undefined> {
  const now = Date.now()
  const cached = gravatarCache.get(hash)
  if (cached && cached.expiresAt > now) return cached.exists

  try {
    const res = await fetch(gravatarUrlFor(hash), {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(GRAVATAR_TIMEOUT_MS),
    })
    // Only 200 and 404 are answers. Anything else (429, 5xx) is a transient
    // failure: return "no avatar" for this render but do not cache it, or a
    // rate-limit burst would hide avatars for a day.
    if (res.status !== 200 && res.status !== 404) return undefined
    const exists = res.status === 200
    gravatarCache.set(hash, {
      exists,
      expiresAt: now + GRAVATAR_CACHE_TTL_MS,
    })
    return exists
  } catch {
    return undefined
  }
}

/**
 * Resolves a Gravatar URL for each email in `emails`, or undefined when there
 * is no image (or no email). Bounded concurrency so a cold cache does not open
 * a few hundred sockets at once.
 */
async function resolveGravatars(
  emails: (string | undefined)[]
): Promise<(string | undefined)[]> {
  const results: (string | undefined)[] = new Array(emails.length)
  let next = 0

  async function worker() {
    while (next < emails.length) {
      const i = next++
      const email = emails[i]
      if (!email) continue
      const hash = gravatarHash(email)
      results[i] = (await gravatarExists(hash))
        ? gravatarUrlFor(hash)
        : undefined
    }
  }

  await Promise.all(
    Array.from({ length: GRAVATAR_CONCURRENCY }, () => worker())
  )
  return results
}

export function hasKeycloakConfig() {
  return Boolean(
    process.env.KEYCLOAK_URL &&
    process.env.KEYCLOAK_REALM &&
    process.env.KEYCLOAK_ADMIN_CLIENT_ID &&
    process.env.KEYCLOAK_ADMIN_CLIENT_SECRET
  )
}

/**
 * Accounts that exist to try the lab's apps, not people: a "test" token in the
 * username (test, test-master, winlab-test, winlab-test-master in 2026-09).
 * They carry a real role, group and admission year so the apps treat them as
 * members, which leaves the username as the one thing that sets them apart.
 */
const TEST_ACCOUNT = /(^|[-_.])test([-_.]|$)/i

/** Enabled accounts that belong to people: the members every page lists. */
function isListed(u: { enabled?: boolean; username?: string }) {
  return Boolean(u.enabled) && !TEST_ACCOUNT.test(u.username ?? "")
}

function flattenAttributes(
  attrs?: Record<string, string[]>
): Record<string, string | undefined> {
  if (!attrs) return {}
  return Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k, v?.[0]]))
}

async function fetchUsers(): Promise<KeycloakUser[]> {
  const kc = await getKeycloakAdmin()
  const users = await kc.users.find({
    realm: process.env.KEYCLOAK_REALM!,
    max: -1,
  })

  const listed = users.filter(isListed)
  const gravatars = await resolveGravatars(listed.map((u) => u.email))

  return listed.map((u, i) => ({
    id: u.id!,
    username: u.username ?? "",
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    enabled: u.enabled ?? false,
    createdTimestamp: u.createdTimestamp ?? 0,
    attributes: flattenAttributes(u.attributes as Record<string, string[]>),
    gravatarUrl: gravatars[i],
  }))
}

export async function getUsers(): Promise<KeycloakUser[]> {
  const now = Date.now()
  if (usersCache && usersCache.expiresAt > now) {
    return usersCache.users
  }

  const users = await fetchUsers()
  usersCache = {
    expiresAt: now + USERS_CACHE_TTL_MS,
    users,
  }
  return users
}

/**
 * Landing-page projection of getUsers(). Rendered into app/page.tsx at build time.
 */
export async function getPublicUsers(): Promise<PublicUser[]> {
  const users = await getUsers()
  return users.map((u) => ({
    id: u.id,
    displayName: u.attributes.chinese_name ?? u.username,
    gravatarUrl: u.gravatarUrl,
    admissionYear: u.attributes.admissionYear,
  }))
}
