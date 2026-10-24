import { Section } from "@/components/section"
import { UserGrid } from "@/components/users/user-grid"
import type { PublicUser } from "@/lib/services/users"

export function Members({
  users,
  error,
}: {
  users: PublicUser[]
  error: boolean
}) {
  return (
    <Section
      id="members"
      title="Members"
      actions={
        <a
          href="https://portal.winlab.tw/members"
          className="text-muted-foreground transition-colors duration-state hover:text-foreground"
        >
          Directory ↗
        </a>
      }
    >
      {error ? (
        <p className="text-muted-foreground">
          Member list is temporarily unavailable.
        </p>
      ) : (
        <UserGrid users={users} />
      )}
    </Section>
  )
}
