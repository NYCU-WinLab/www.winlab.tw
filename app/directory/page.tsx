import { getDirectoryMembers } from "@/lib/services/users"
import { MemberTable } from "@/components/directory/member-table"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Directory | WINLab",
  robots: { index: false },
}

export default async function DirectoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/directory")
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
