import * as React from "react"
import { cn } from "@/lib/utils"

// One group on a page, where other kits would use a card. Layer 1 has no
// surface, so the group is a divider above it and space around it; the title
// and its actions sit on one row, like SectionHeader in page-header. No
// subtitle: put what the group needs to say in its content.
function Section({
  title,
  actions,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  /** The group's name; becomes an h2 and labels the section. */
  title?: React.ReactNode
  /** Buttons that act on this group only. */
  actions?: React.ReactNode
}) {
  const id = React.useId()
  return (
    <section
      data-slot="section"
      aria-labelledby={title ? id : undefined}
      className={cn("flex min-w-0 flex-col gap-4 border-t pt-6", className)}
      {...props}
    >
      {title && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id={id} className="min-w-0 font-semibold">
            {title}
          </h2>
          {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export { Section }
