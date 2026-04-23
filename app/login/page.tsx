"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useCallback, useState } from "react"
import { createClient } from "@/lib/supabase/client"

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/directory"
  const error = searchParams.get("error")
  const [loading, setLoading] = useState(false)

  const handleLogin = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo =
        `${window.location.origin}/api/auth/callback` +
        `?next=${encodeURIComponent(next)}`

      await supabase.auth.signInWithOAuth({
        provider: "keycloak",
        options: {
          redirectTo,
          scopes: "openid",
        },
      })
    } catch {
      setLoading(false)
    }
  }, [next])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-xs tracking-widest text-muted-foreground uppercase">
          WinLab
        </p>
        <h1 className="text-lg font-medium">Directory</h1>
        <p className="text-xs text-muted-foreground">實驗室成員限定</p>
      </div>

      {error && <p className="text-xs text-destructive">登入失敗，請重試。</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="rounded-md border border-border/60 bg-muted/30 px-6 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
      >
        {loading ? "導向 Keycloak…" : "使用 Keycloak 登入"}
      </button>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
