"use client"

import { AnimatePresence, LazyMotion, domAnimation } from "motion/react"
import * as m from "motion/react-m"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // LazyMotion + `m` components ship only the animation feature set actually
  // used (domAnimation), instead of the full `motion` bundle. `strict` turns
  // any stray `motion.*` import back into a build-time error.
  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  )
}
