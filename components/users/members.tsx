"use client"

import Link from "next/link"
import * as m from "motion/react-m"

import { useInView } from "@/hooks/use-in-view"
import { UserGrid } from "@/components/users/user-grid"

import type { PublicUser } from "@/lib/services/users"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

export function Members({
  users,
  error,
}: {
  users: PublicUser[]
  error: boolean
}) {
  const { ref, inView } = useInView()

  return (
    <section id="members" className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6">
      <m.h2
        ref={ref as React.RefObject<HTMLHeadingElement>}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={spring}
        className="mb-8 text-center text-2xl font-medium sm:text-3xl"
      >
        Members
      </m.h2>

      {error ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Member list is temporarily unavailable.
        </p>
      ) : (
        <UserGrid users={users} />
      )}

      {!error && (
        <m.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ ...spring, delay: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/directory"
            className="group flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="transition-transform duration-150 group-hover:translate-x-0.5">
              →
            </span>
            <span>full directory</span>
          </Link>
        </m.div>
      )}
    </section>
  )
}
