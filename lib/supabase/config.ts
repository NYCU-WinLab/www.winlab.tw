type SupabaseConfig = {
  url: string
  key: string
}

const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: "https://yissfqcdmzsxwfnzrflz.supabase.co",
  key: "sb_publishable_jwDS4JBmgcomECdzHVitaQ_jS6Z2ioZ",
}

function readSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!url || !key) {
    return DEFAULT_SUPABASE_CONFIG
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
      "Missing Supabase auth config: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
    )
  }

  return config
}
