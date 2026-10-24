import * as React from "react"

import { cn } from "@/lib/utils"

// The section block with everything centered: a divider above, the title
// and the content on the page's center line.
export function CenteredSection({
  title,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & { title: string }) {
  const id = React.useId()
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "flex min-w-0 flex-col items-center gap-6 border-t pt-6 text-center",
        className
      )}
      {...props}
    >
      <h2 id={id} className="font-semibold">
        {title}
      </h2>
      {children}
    </section>
  )
}
