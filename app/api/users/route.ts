import { getUsers } from "@/lib/services/users"

export async function GET() {
  try {
    const users = await getUsers()
    return Response.json(users)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "failed to fetch users"
    return Response.json({ error: message }, { status: 500 })
  }
}
