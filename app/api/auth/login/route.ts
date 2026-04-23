import { getSupabaseConfig } from "@/lib/supabase/config"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const rawNext = requestUrl.searchParams.get("next") ?? "/directory"
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/directory"

  const config = getSupabaseConfig()

  if (!config) {
    return NextResponse.redirect(`${origin}/login?next=${encodeURIComponent(next)}&error=auth_unavailable`)
  }

  const supabase = createClient(
    config.url,
    config.key
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "keycloak",
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: "openid",
      skipBrowserRedirect: true,
    },
  })

  if (error || !data?.url) {
    return NextResponse.redirect(`${origin}/login?next=${encodeURIComponent(next)}&error=auth_error`)
  }

  return NextResponse.redirect(data.url)
}
