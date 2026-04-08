import { getUsers } from "@/lib/services/users"

export async function GET() {
  try {
    const users = await getUsers()
    const safe = users.map((u) => ({
      id: u.id,
      displayName: u.attributes.chinese_name ?? u.username,
      gravatarUrl: u.gravatarUrl,
      admissionYear: u.attributes.admissionYear,
    }))
    return Response.json(safe)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "failed to fetch users"
    return Response.json({ error: message }, { status: 500 })
  }
}
