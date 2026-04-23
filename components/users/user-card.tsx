"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import type { PublicUser } from "@/hooks/use-users"

export function UserCard({ user }: { user: PublicUser }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="size-20 sm:size-28">
        <AvatarImage src={user.gravatarUrl} alt={user.displayName} />
        <AvatarFallback className="text-2xl">
          {user.displayName.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
      <span className="text-base font-medium">{user.displayName}</span>
    </div>
  )
}
