import { auth, getSession, hasAuthConfig } from "@/lib/auth"
import { publicOrigin } from "@/lib/origin"
import { safeNext } from "@/lib/safe-next"

// /login's button lands here and goes straight on to Keycloak.
export async function GET(request: Request) {
  const origin = publicOrigin(request)
  const next = safeNext(new URL(request.url).searchParams.get("next"))

  if (!hasAuthConfig()) {
    return Response.redirect(
      `${origin}/login?next=${encodeURIComponent(next)}&error=auth_unavailable`,
      303
    )
  }

  if (await getSession(request.headers)) {
    return Response.redirect(`${origin}${next}`, 303)
  }

  const response = await auth.api.signInSocial({
    body: {
      provider: "keycloak",
      callbackURL: next,
      errorCallbackURL: `/login?next=${encodeURIComponent(next)}&error=auth_error`,
    },
    headers: request.headers,
    asResponse: true,
  })
  const { url: keycloak } = (await response.json()) as { url?: string }
  if (!response.ok || !keycloak) {
    return Response.redirect(
      `${origin}/login?next=${encodeURIComponent(next)}&error=auth_error`,
      303
    )
  }

  // Keep the state cookies Better Auth set for the callback.
  const redirect = new Response(null, {
    status: 303,
    headers: { location: keycloak },
  })
  for (const cookie of response.headers.getSetCookie())
    redirect.headers.append("set-cookie", cookie)
  return redirect
}
