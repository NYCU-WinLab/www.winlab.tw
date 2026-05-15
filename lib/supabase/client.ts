import { createBrowserClient } from "@supabase/ssr"
import { requireBrowserSupabaseConfig } from "@/lib/supabase/config"

export const createClient = () => {
  const config = requireBrowserSupabaseConfig()

  return createBrowserClient(config.url, config.key, {
    cookieOptions: { name: "www" },
  })
}
