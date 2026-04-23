import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { hasSupabaseConfig, requireSupabaseConfig } from "@/lib/supabase/config"

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  if (!hasSupabaseConfig()) {
    return response
  }
  const config = requireSupabaseConfig()

  const supabase = createServerClient(
    config.url,
    config.key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ["/directory/:path*"],
}
