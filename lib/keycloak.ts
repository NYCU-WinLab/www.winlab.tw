import KcAdminClient from "@keycloak/keycloak-admin-client"

let client: KcAdminClient | null = null
let tokenExpiresAt = 0
let inflight: Promise<KcAdminClient> | null = null

export async function getKeycloakAdmin() {
  if (client && Date.now() < tokenExpiresAt) return client
  if (inflight) return inflight

  inflight = (async () => {
    client = new KcAdminClient({
      baseUrl: process.env.KEYCLOAK_URL!,
      realmName: process.env.KEYCLOAK_REALM!,
    })

    await client.auth({
      grantType: "client_credentials",
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET!,
    })

    tokenExpiresAt = Date.now() + 4 * 60 * 1000
    inflight = null
    return client
  })()

  return inflight
}
