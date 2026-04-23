"use client"

import { motion } from "motion/react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Footer() {
  return (
    <footer className="fixed right-0 bottom-0 z-50 hidden px-4 py-3 sm:block sm:p-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.span
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.4,
            }}
            className="cursor-default text-xs text-muted-foreground"
          >
            © {new Date().getFullYear()}
          </motion.span>
        </TooltipTrigger>
        <TooltipContent side="top" align="end">
          WinLab is GOOD
        </TooltipContent>
      </Tooltip>
    </footer>
  )
}
