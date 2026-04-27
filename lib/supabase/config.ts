type SupabaseConfig = {
  url: string
  key: string
}

// Server-side reads non-prefixed vars (Turbopack/Next.js 16 doesn't expose
// NEXT_PUBLIC_* to server runtime). Client-side bundles inline NEXT_PUBLIC_*
// at build time via lib/supabase/client.ts directly.
function readSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!url || !key) {
    return null
  }

  return { url, key }
}

export function getSupabaseConfig() {
  return readSupabaseConfig()
}

export function hasSupabaseConfig() {
  return readSupabaseConfig() !== null
}

export function requireSupabaseConfig() {
  const config = readSupabaseConfig()

  if (!config) {
    throw new Error(
      "Missing Supabase auth config: set SUPABASE_URL and SUPABASE_ANON_KEY (server) or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (build-time)"
    )
  }

  return config
}
