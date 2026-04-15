import { Skeleton } from "@/components/ui/skeleton"

export default function DirectoryLoading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Skeleton className="mb-2 h-9 w-28" />
      <Skeleton className="mb-8 h-4 w-20" />
      <div className="space-y-px overflow-hidden rounded-lg border border-border/60">
        <div className="border-b border-border/60 bg-muted/30 px-4 py-2.5">
          <div className="flex gap-6">
            {["w-8", "w-6", "w-10", "w-8", "w-12"].map((w, i) => (
              <Skeleton key={i} className={`h-3 ${w}`} />
            ))}
          </div>
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border/50 px-4 py-3"
          >
            <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="ml-2 h-5 w-14 rounded-full" />
            <Skeleton className="ml-4 h-3.5 w-36" />
            <Skeleton className="ml-2 h-3.5 w-20" />
          </div>
        ))}
      </div>
    </main>
  )
}
