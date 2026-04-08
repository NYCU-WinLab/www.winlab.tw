"use client"

import { motion } from "motion/react"

import { useInView } from "@/hooks/use-in-view"
import { UserCard } from "@/components/users/user-card"

import type { KeycloakUser } from "@/lib/services/users"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

type YearGroup = { year: string; users: KeycloakUser[] }

function groupByYear(users: KeycloakUser[]): YearGroup[] {
  const map = new Map<string, KeycloakUser[]>()

  for (const user of users) {
    const year = user.attributes.admissionYear
    if (!year) continue
    const group = map.get(year) ?? []
    group.push(user)
    map.set(year, group)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, users]) => ({ year, users }))
}

function YearSection({ year, users }: YearGroup) {
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref as React.RefObject<HTMLElement>}>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={spring}
        className="text-muted-foreground mb-8 text-center text-sm font-medium"
      >
        Class of {year}
      </motion.h2>
      <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {users.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...spring, delay: i * 0.04 }}
          >
            <UserCard user={user} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function UserGrid({ users }: { users: KeycloakUser[] }) {
  const groups = groupByYear(users)

  if (groups.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        No users with admission year found.
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {groups.map(({ year, users }) => (
        <YearSection key={year} year={year} users={users} />
      ))}
    </div>
  )
}
