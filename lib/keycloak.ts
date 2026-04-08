import KcAdminClient from "@keycloak/keycloak-admin-client"

let client: KcAdminClient | null = null
let tokenExpiresAt = 0

export async function getKeycloakAdmin() {
  const now = Date.now()

  if (client && now < tokenExpiresAt) {
    return client
  }

  client = new KcAdminClient({
    baseUrl: process.env.KEYCLOAK_URL!,
    realmName: process.env.KEYCLOAK_REALM!,
  })

  await client.auth({
    grantType: "client_credentials",
    clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID!,
    clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET!,
  })

  // refresh 5 min before expiry — or every 4 min if we can't tell
  tokenExpiresAt = now + 4 * 60 * 1000

  return client
}
