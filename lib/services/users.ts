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
  gravatarUrl: string
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
  gravatarUrl: string
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

function gravatarUrl(email?: string) {
  const hash = email
    ? createHash("md5").update(email.trim().toLowerCase()).digest("hex")
    : "0"
  return `https://gravatar.com/avatar/${hash}?d=404&s=160`
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

  return users
    .filter((u) => u.enabled)
    .map((u) => ({
      id: u.id!,
      username: u.username ?? "",
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      enabled: u.enabled ?? false,
      createdTimestamp: u.createdTimestamp ?? 0,
      attributes: flattenAttributes(u.attributes as Record<string, string[]>),
      gravatarUrl: gravatarUrl(u.email),
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

  const members = users
    .filter((u) => u.enabled)
    .map((u) => {
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
        gravatarUrl: gravatarUrl(u.email),
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
