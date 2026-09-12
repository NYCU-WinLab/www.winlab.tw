"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"

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
    <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-background/70 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="animate-fade-in">
            <Link href="/" className="text-xs text-muted-foreground">
              WinLab
            </Link>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          Wireless Internet Laboratory
        </TooltipContent>
      </Tooltip>
      <div className="flex items-center gap-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="animate-fade-in">
              <Link
                href="/directory"
                className="group flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                directory
                <span className="ml-0.5 inline-block opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100">
                  ↗
                </span>
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            Lab member directory
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="animate-fade-in">
              <Link
                href="https://portal.winlab.tw"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                portal
                <span className="ml-0.5 inline-block opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100">
                  ↗
                </span>
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            WinLab Portal
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="animate-fade-in cursor-pointer text-xs text-muted-foreground"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {mounted
                ? resolvedTheme === "dark"
                  ? "Light"
                  : "Dark"
                : "\u00A0"}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            {mounted &&
              `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
