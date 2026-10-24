import Link from "next/link"

import { AppShell } from "@/components/app-shell"

export default function NotFound() {
  return (
    <AppShell
      layout="spotlight"
      breadcrumb={[
        { label: "WinLab", href: "/", tip: "Wireless Internet Laboratory" },
      ]}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-title font-medium">
          This page doesn&apos;t exist, yet.
        </h1>
        <Link
          href="/"
          className="text-muted-foreground underline underline-offset-4 transition-colors duration-state hover:text-foreground"
        >
          Back to safety
        </Link>
      </div>
    </AppShell>
  )
}
