import { createClient } from "@/lib/supabase/server"
import { hasSupabaseConfig } from "@/lib/supabase/config"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const rawNext = requestUrl.searchParams.get("next") ?? "/directory"
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/directory"

  if (!hasSupabaseConfig()) {
    return NextResponse.redirect(
      `${origin}/login?next=${encodeURIComponent(next)}&error=auth_unavailable`
    )
  }
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "keycloak",
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: "openid",
      skipBrowserRedirect: true,
    },
  })

  if (error || !data?.url) {
    return NextResponse.redirect(
      `${origin}/login?next=${encodeURIComponent(next)}&error=auth_error`
    )
  }

  return NextResponse.redirect(data.url)
}
