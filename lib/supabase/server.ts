import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { requireSupabaseConfig } from "@/lib/supabase/config"

export const createClient = async () => {
  const config = requireSupabaseConfig()

  const cookieStore = await cookies()

  return createServerClient(config.url, config.key, {
    cookieOptions: { name: "www" },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server component — cookies can't be set, ignore
        }
      },
    },
  })
}
