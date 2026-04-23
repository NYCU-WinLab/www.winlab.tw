import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseConfig } from "@/lib/supabase/config"

export const createClient = () => {
  const config = getSupabaseConfig()
  if (!config) {
    throw new Error("Supabase auth is not configured")
  }

  return createBrowserClient(config.url, config.key, {
    cookieOptions: {
      domain:
        process.env.NODE_ENV === "production" &&
        typeof window !== "undefined" &&
        window.location.hostname.includes("winlab.tw")
          ? ".winlab.tw"
          : undefined,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
}
