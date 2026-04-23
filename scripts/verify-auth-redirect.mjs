const siteUrl = process.env.SITE_URL || "https://www.winlab.tw"
const loginPath = "/api/auth/login?next=%2Fdirectory"

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function fetchRedirect(url) {
  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
  })

  return {
    status: response.status,
    location: response.headers.get("location"),
  }
}

async function main() {
  const first = await fetchRedirect(`${siteUrl}${loginPath}`)
  console.log("login route:", first)

  assert(
    first.status >= 300 && first.status < 400,
    `Expected /api/auth/login to redirect, got ${first.status}`
  )
  assert(first.location, "Missing redirect location from /api/auth/login")
  assert(
    first.location.includes("/auth/v1/authorize"),
    `Expected Supabase authorize URL, got ${first.location}`
  )
  assert(
    first.location.includes(
      encodeURIComponent(`${siteUrl}/api/auth/callback?next=%2Fdirectory`)
    ),
    `Expected callback URL in authorize redirect, got ${first.location}`
  )

  const second = await fetchRedirect(first.location)
  console.log("supabase authorize:", second)

  assert(
    second.status >= 300 && second.status < 400,
    `Expected Supabase authorize URL to redirect, got ${second.status}`
  )
  assert(second.location, "Missing redirect location from Supabase authorize")
  assert(
    second.location.startsWith("https://auth.winlab.tw/realms/winlab/"),
    `Expected Keycloak realm redirect, got ${second.location}`
  )

  console.log("Auth redirect verification passed.")
}

main().catch((error) => {
  console.error("Auth redirect verification failed.")
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
