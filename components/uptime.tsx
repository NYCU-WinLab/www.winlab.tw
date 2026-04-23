"use client"

import { motion } from "motion/react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ORIGIN = new Date("1989-08-01T00:00:00").getTime()

function formatDays(ms: number) {
  return `${Math.floor(ms / 86400000).toLocaleString()}d`
}

function formatFull(ms: number) {
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const y = Math.floor(d / 365)
  const rd = d % 365
  return `${y}y ${rd}d ${h}h ${m}m ${sec}s`
}

export function Uptime() {
  const elapsed = Date.now() - ORIGIN

  return (
    <div className="fixed bottom-0 left-0 z-50 px-4 py-3 sm:p-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.span
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
            className="text-muted-foreground cursor-default text-xs tabular-nums"
          >
            uptime: {formatDays(elapsed)}
          </motion.span>
        </TooltipTrigger>
        <TooltipContent side="top" align="start">
          <span className="tabular-nums">{formatFull(elapsed)}</span>
          <br />
          <span className="text-muted-foreground">since Aug 1989</span>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
