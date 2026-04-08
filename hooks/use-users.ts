"use client"

import { useCallback, useEffect, useState } from "react"

export type PublicUser = {
  id: string
  displayName: string
  gravatarUrl: string
  admissionYear?: string
}

type UseUsersReturn = {
  users: PublicUser[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<PublicUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/users")

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `${res.status} ${res.statusText}`)
      }

      const data: PublicUser[] = await res.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return { users, isLoading, error, refetch: fetchUsers }
}
