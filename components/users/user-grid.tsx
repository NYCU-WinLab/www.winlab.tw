"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { PublicUser } from "@/lib/services/users"

type YearGroup = { year: string; users: PublicUser[] }

function groupByYear(users: PublicUser[]): YearGroup[] {
  const map = new Map<string, PublicUser[]>()
  for (const user of users) {
    const year = user.admissionYear
    if (!year) continue
    const group = map.get(year) ?? []
    group.push(user)
    map.set(year, group)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, users]) => ({ year, users }))
}

// The newest classes shown before the rest folds into "…".
const SHOWN_CLASSES = 4

// One row per class, newest first: the year on the left, its members as
// avatar and name. Older classes open in place.
export function UserGrid({ users }: { users: PublicUser[] }) {
  const [expanded, setExpanded] = React.useState(false)
  const groups = groupByYear(users)
  const shown = expanded ? groups : groups.slice(0, SHOWN_CLASSES)

  if (groups.length === 0) {
    return (
      <p className="text-muted-foreground">
        No users with admission year found.
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <ul className="flex w-full flex-col">
        {shown.map(({ year, users }) => (
          <li
            key={year}
            className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:gap-8"
          >
            <span className="w-24 shrink-0 text-muted-foreground tabular-nums">
              Class of {year}
            </span>
            <ul className="grid flex-1 stagger-rise grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-4">
              {users.map((user) => (
                <li key={user.id} className="flex min-w-0 items-center gap-3">
                  <Avatar>
                    {/* gravatarUrl is only present when the server confirmed
                      an image exists, so this never requests a known 404. */}
                    {user.gravatarUrl && (
                      <AvatarImage
                        src={user.gravatarUrl}
                        alt={user.displayName}
                        loading="lazy"
                      />
                    )}
                    <AvatarFallback>
                      {user.displayName.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{user.displayName}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {!expanded && groups.length > SHOWN_CLASSES && (
        <Button
          variant="ghost"
          aria-label={`Show ${groups.length - SHOWN_CLASSES} more classes`}
          onClick={() => setExpanded(true)}
        >
          …
        </Button>
      )}
    </div>
  )
}
