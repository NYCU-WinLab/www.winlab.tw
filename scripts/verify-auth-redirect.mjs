const siteUrl = process.env.SITE_URL || "https://www.winlab.tw"
const signInPath = "/sign-in?next=%2Fdirectory"

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function main() {
  const response = await fetch(`${siteUrl}${signInPath}`, {
    method: "GET",
    redirect: "manual",
  })
  const location = response.headers.get("location")
  console.log("sign-in route:", { status: response.status, location })

  assert(
    response.status >= 300 && response.status < 400,
    `Expected /sign-in to redirect, got ${response.status}`
  )
  assert(location, "Missing redirect location from /sign-in")
  assert(
    location.startsWith(
      "https://auth.winlab.tw/realms/winlab/protocol/openid-connect/auth"
    ),
    `Expected Keycloak authorize URL, got ${location}`
  )
  assert(
    location.includes(
      encodeURIComponent(`${siteUrl}/api/auth/callback/keycloak`)
    ),
    `Expected callback URL in authorize redirect, got ${location}`
  )
  assert(
    location.includes("code_challenge_method=S256"),
    `Expected PKCE in authorize redirect, got ${location}`
  )

  console.log("Auth redirect verification passed.")
}

main().catch((error) => {
  console.error("Auth redirect verification failed.")
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
