"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"
import { motion } from "motion/react"

import { useInView } from "@/hooks/use-in-view"
import { About } from "@/components/about"
import { FindUs } from "@/components/find-us"
import { Hero } from "@/components/hero"
import { Professor } from "@/components/professor"
import { UserGrid } from "@/components/users/user-grid"
import { useUsers } from "@/hooks/use-users"

export default function Page() {
  const { users, isLoading, error } = useUsers()
  const { ref: membersRef, inView: membersInView } = useInView()

  return (
    <>
      <Hero />

      <About />

      <Professor />

      <div className="mx-auto max-w-5xl p-6 pb-24">
        <motion.h1
          ref={membersRef as React.RefObject<HTMLHeadingElement>}
          initial={{ opacity: 0, y: 16 }}
          animate={membersInView ? { opacity: 1, y: 0 } : {}}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-8 text-center text-3xl font-medium"
        >
          Members
        </motion.h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <UserGrid users={users} />
        )}

        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={membersInView ? { opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
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
          </motion.div>
        )}
      </div>

      <FindUs />
    </>
  )
}
