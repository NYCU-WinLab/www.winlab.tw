import { getDirectoryMembers } from "@/lib/services/users"
import { MemberTable } from "@/components/directory/member-table"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Directory | WINLab",
  robots: { index: false },
}

export default async function DirectoryPage() {
  let user = null

  try {
    const supabase = await createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    user = currentUser
  } catch {
    user = null
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-5xl items-center px-4 py-20 sm:px-6">
        <section className="w-full rounded-3xl border border-border/60 bg-muted/20 p-8 text-center sm:p-10">
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
            WinLab Directory
          </p>
          <h1 className="mt-3 text-2xl font-medium sm:text-3xl">
            請先登入後查看通訊錄
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            這裡只提供實驗室成員使用。登入後才會載入成員名單與聯絡資訊。
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/login?next=/directory">前往登入</Link>
            </Button>
          </div>
        </section>
      </main>
    )
  }

  const members = await getDirectoryMembers()

  return (
    <main className="mx-auto max-w-5xl px-4 pt-20 pb-20 sm:px-6 sm:pt-24 sm:pb-12">
      <h1 className="mb-2 text-2xl font-medium sm:text-3xl">Directory</h1>
      <p className="mb-8 text-sm text-muted-foreground">實驗室成員通訊錄</p>
      <MemberTable members={members} />
    </main>
  )
}
