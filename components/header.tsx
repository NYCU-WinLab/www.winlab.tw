"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { motion } from "motion/react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)))
  }, [])

  return (
    <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between p-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          >
            <Link href="/" className="text-muted-foreground text-xs">
              WinLab
            </Link>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          Wireless Internet Laboratory
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="text-muted-foreground cursor-pointer text-xs"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {mounted
              ? resolvedTheme === "dark"
                ? "Light"
                : "Dark"
              : "\u00A0"}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          {mounted &&
            `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        </TooltipContent>
      </Tooltip>
    </header>
  )
}
