"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { KeycloakUser } from "@/lib/services/users"

function getInitials(user: KeycloakUser) {
  const cn = user.attributes.chinese_name
  if (cn) return cn.slice(0, 2)
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  return user.username.slice(0, 2).toUpperCase()
}

function formatDate(timestamp: number) {
  if (!timestamp) return "—"
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp))
}

export function UserTable({ users }: { users: KeycloakUser[] }) {
  if (users.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        No users found — either Keycloak is empty or something went sideways.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12" />
          <TableHead>Username</TableHead>
          <TableHead>中文姓名</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>入學年度</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell className="font-medium">{user.username}</TableCell>
            <TableCell>
              {user.attributes.chinese_name ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {user.email ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground tabular-nums">
              {user.attributes.admissionYear ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant={user.enabled ? "default" : "secondary"}>
                {user.enabled ? "Active" : "Disabled"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground tabular-nums">
              {formatDate(user.createdTimestamp)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
