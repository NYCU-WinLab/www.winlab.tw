import { getPublicUsers } from "@/lib/services/users"

export async function GET() {
  try {
    return Response.json(await getPublicUsers())
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "failed to fetch users"
    return Response.json({ error: message }, { status: 500 })
  }
}
