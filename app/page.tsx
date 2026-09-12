import { About } from "@/components/about"
import { FindUs } from "@/components/find-us"
import { Hero } from "@/components/hero"
import { JsonLd } from "@/components/json-ld"
import { Professor } from "@/components/professor"
import { Research } from "@/components/research"
import { Members } from "@/components/users/members"
import {
  getPublicUsers,
  hasKeycloakConfig,
  type PublicUser,
} from "@/lib/services/users"

// Members are rendered on the server and the page is regenerated in the
// background at most once an hour (ISR). Before this the list was fetched from
// the browser after hydration, so the SSR HTML had an empty Members section
// and every visitor paid for a Keycloak round-trip.
export const revalidate = 3600
// The Keycloak admin client sends an Authorization header, which Next treats as
// a dynamic signal and would otherwise flip this route to per-request
// rendering. force-static keeps it prerendered; revalidate above sets the ISR
// window.
export const dynamic = "force-static"

async function loadMembers(): Promise<{
  users: PublicUser[]
  error: boolean
}> {
  // CI builds without Keycloak env — degrade to an empty list rather than fail
  // the build. Vercel has the env, so production is regenerated with data.
  if (!hasKeycloakConfig()) return { users: [], error: true }
  try {
    return { users: await getPublicUsers(), error: false }
  } catch {
    return { users: [], error: true }
  }
}

export default async function Page() {
  const { users, error } = await loadMembers()

  return (
    <main>
      {/* Organisation schema belongs on the landing page, not on every
          route — /directory is noindex, and keeping this out of the root
          layout means its inline <script> never has to satisfy the stricter
          nonce CSP that proxy.ts applies there. */}
      <JsonLd />

      <Hero />

      <About />

      <Research />

      <Professor />

      <Members users={users} error={error} />

      <FindUs />
    </main>
  )
}
