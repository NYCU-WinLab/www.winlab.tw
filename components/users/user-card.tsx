"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import type { KeycloakUser } from "@/lib/services/users"

export function UserCard({ user }: { user: KeycloakUser }) {
  const name = user.attributes.chinese_name ?? user.username

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="size-28">
        <AvatarImage src={user.gravatarUrl} alt={name} />
        <AvatarFallback className="text-2xl">{name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <span className="text-base font-medium">{name}</span>
    </div>
  )
}
