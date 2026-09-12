import { createHash } from "crypto"

import { getKeycloakAdmin } from "@/lib/keycloak"
import { emitErrorLog } from "@/lib/otel/log"

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

/** The shape the public landing page and /api/users expose. No email, no hash
 *  for members without an avatar: the MD5 in a Gravatar URL is reversible
 *  against a known address pattern, so it is only sent when it buys something. */
export type PublicUser = {
  id: string
  displayName: string
  gravatarUrl?: string
  admissionYear?: string
}

export type MemberRole =
  | "professor"
  | "phd"
  | "master"
  | "undergraduate"
  | "alumni"
  | "staff"
  | "pending"

export type DirectoryMember = {
  id: string
  name: string
  nameEn: string
  email: string
  phone?: string
  role: MemberRole
  position?: string
  gravatarUrl?: string
  github?: string
  office?: string
  researchAreas: string[]
  admissionYear?: string
  studentId?: string
}

export const ROLE_LABELS: Record<MemberRole, string> = {
  professor: "教授",
  phd: "博士生",
  master: "碩士生",
  undergraduate: "大學生",
  alumni: "校友",
  staff: "行政人員",
  pending: "待確認",
}

export const ROLE_ORDER: MemberRole[] = [
  "professor",
  "phd",
  "master",
  "undergraduate",
  "staff",
  "alumni",
  "pending",
]

/**
 * Keycloak's `role` attribute has no validation, so any string can arrive.
 * Unrecognised values become "pending" (待確認) rather than being asserted
 * through an `as MemberRole` cast — a visible degradation instead of a row
 * that vanishes from the directory. Cleaning up bad data doesn't retire this:
 * one stray leading space brings it back.
 *
 * Checked against ROLE_LABELS because only that is a Record<MemberRole, …> the
 * compiler keeps exhaustive — ROLE_ORDER can silently lag a newly added role.
 * `Object.hasOwn`, not `in`, so a role named "toString" can't match via the
 * prototype chain.
 *
 * Offending values go into `unrecognised` for the caller to report once per
 * refresh. Coercing in silence would leave a malformed attribute
 * indistinguishable from a member whose role genuinely hasn't been assigned —
 * both render as 待確認 — so nobody would ever be told to go fix the data.
 */
function toMemberRole(
  value: string | undefined,
  userId: string,
  unrecognised: Map<string, string>
): MemberRole {
  if (value && Object.hasOwn(ROLE_LABELS, value)) {
    return value as MemberRole
  }
  if (value) {
    unrecognised.set(userId, value)
  }
  return "pending"
}

const USERS_CACHE_TTL_MS = 5 * 60 * 1000

let usersCache:
  | {
      expiresAt: number
      users: KeycloakUser[]
    }
  | undefined

let directoryCache:
  | {
      expiresAt: number
      members: DirectoryMember[]
    }
  | undefined

/**
 * Gravatar existence is resolved server-side so the browser never fires a
 * request that is known to 404. Before this, the landing page issued one
 * `d=404` request per member (263 at the time, 163 of them 404s) and that
 * alone was the largest cost in the mobile Lighthouse run.
 *
 * Results are memoised per hash for a day. A miss costs one HEAD request; a
 * network failure is not cached, so it is retried on the next refresh rather
 * than hiding an avatar for 24 hours.
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
    const exists = res.ok
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

  const enabled = users.filter((u) => u.enabled)
  const gravatars = await resolveGravatars(enabled.map((u) => u.email))

  return enabled.map((u, i) => ({
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
 * Landing-page projection of getUsers(). Used both by app/page.tsx (server
 * render) and app/api/users/route.ts, so the two can never disagree on what is
 * public.
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

export async function getDirectoryMembers(): Promise<DirectoryMember[]> {
  const now = Date.now()
  if (directoryCache && directoryCache.expiresAt > now) {
    return directoryCache.members
  }

  const kc = await getKeycloakAdmin()
  const users = await kc.users.find({
    realm: process.env.KEYCLOAK_REALM!,
    max: -1,
  })

  const unrecognisedRoles = new Map<string, string>()
  const enabled = users.filter((u) => u.enabled)
  const gravatars = await resolveGravatars(enabled.map((u) => u.email))

  const members = enabled
    .map((u, i) => {
      const attrs = (u.attributes as Record<string, string[]>) ?? {}
      const nameEn = [u.firstName, u.lastName].filter(Boolean).join(" ")

      return {
        id: u.id!,
        name: attrs.chinese_name?.[0] ?? u.username ?? "",
        nameEn,
        email: u.email ?? "",
        phone: attrs.phone?.[0],
        role: toMemberRole(attrs.role?.[0], u.id!, unrecognisedRoles),
        position: attrs.position?.[0],
        gravatarUrl: gravatars[i],
        github: attrs.github?.[0],
        office: attrs.office?.[0],
        researchAreas: attrs.research_areas ?? [],
        admissionYear: attrs.admissionYear?.[0],
        studentId: attrs.student_id?.[0],
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, "zh-TW"))

  // One record per refresh, not per member: the 5-minute cache bounds this to
  // at most 12 logs an hour however many attributes are malformed.
  if (unrecognisedRoles.size > 0) {
    emitErrorLog({
      message: "Keycloak role attribute outside MemberRole, coerced to pending",
      attributes: {
        "keycloak.unrecognised_role_count": unrecognisedRoles.size,
        "keycloak.unrecognised_roles": [...unrecognisedRoles].map(
          ([userId, role]) => `${userId}=${role}`
        ),
      },
    })
  }

  directoryCache = {
    expiresAt: now + USERS_CACHE_TTL_MS,
    members,
  }

  return members
}
