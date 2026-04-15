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
  title?: string
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

export async function getUsers(): Promise<KeycloakUser[]> {
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

export async function getDirectoryMembers(): Promise<DirectoryMember[]> {
  const kc = await getKeycloakAdmin()
  const users = await kc.users.find({
    realm: process.env.KEYCLOAK_REALM!,
    max: -1,
  })

  return users
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
        role: (attrs.role?.[0] as MemberRole) ?? "pending",
        title: attrs.title?.[0],
        gravatarUrl: gravatarUrl(u.email),
        github: attrs.github?.[0],
        office: attrs.office?.[0],
        researchAreas: attrs.research_areas ?? [],
        admissionYear: attrs.admissionYear?.[0],
        studentId: attrs.student_id?.[0],
      }
    })
}
