import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseConfig } from "@/lib/supabase/config"

export const createClient = async () => {
  const config = getSupabaseConfig()
  if (!config) {
    throw new Error("Supabase auth is not configured")
  }

  const cookieStore = await cookies()

  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              domain:
                process.env.NODE_ENV === "production"
                  ? ".winlab.tw"
                  : undefined,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            })
          )
        } catch {
          // Server component — cookies can't be set, ignore
        }
      },
    },
  })
}
