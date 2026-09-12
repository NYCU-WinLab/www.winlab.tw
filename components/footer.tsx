"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Footer() {
  return (
    <footer className="animate-fade-in fixed right-0 bottom-0 z-50 hidden px-4 py-3 sm:block sm:p-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default text-xs text-muted-foreground">
            © {new Date().getFullYear()}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="end">
          WinLab is GOOD
        </TooltipContent>
      </Tooltip>
    </footer>
  )
}
