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
  return Object.fromEntries(
    Object.entries(attrs).map(([k, v]) => [k, v?.[0]])
  )
}

export async function getUsers(): Promise<KeycloakUser[]> {
  const kc = await getKeycloakAdmin()
  const users = await kc.users.find({
    realm: process.env.KEYCLOAK_REALM!,
    max: -1,
  })

  return users.filter((u) => u.enabled).map((u) => ({
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
