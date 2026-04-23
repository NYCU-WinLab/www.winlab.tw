import { getDirectoryMembers } from "@/lib/services/users"
import { MemberTable } from "@/components/directory/member-table"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Directory | WINLab",
  robots: { index: false },
}

export default async function DirectoryPage() {
  const members = await getDirectoryMembers()

  return (
    <main className="mx-auto max-w-5xl px-4 pt-20 pb-12 sm:px-6 sm:pt-24">
      <h1 className="mb-2 text-2xl font-medium sm:text-3xl">Directory</h1>
      <p className="mb-8 text-sm text-muted-foreground">實驗室成員通訊錄</p>
      <MemberTable members={members} />
    </main>
  )
}
