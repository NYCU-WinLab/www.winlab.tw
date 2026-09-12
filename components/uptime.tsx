"use client"

import { useSyncExternalStore } from "react"

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

function subscribe(onTick: () => void) {
  const interval = window.setInterval(onTick, 1000)
  return () => window.clearInterval(interval)
}

function getNow() {
  return Math.floor(Date.now() / 1000) * 1000
}

function getServerNow() {
  return 0
}

export function Uptime() {
  // The value depends on the client clock, so it cannot be prerendered without
  // a hydration mismatch. The server snapshot is 0 and renders nothing, which
  // removes the visible "uptime: 0d" placeholder the static HTML used to carry;
  // the client snapshot is correct from the first post-hydration render.
  const now = useSyncExternalStore(subscribe, getNow, getServerNow)

  if (now === 0) return null

  const elapsed = now - ORIGIN

  return (
    <div className="animate-fade-in fixed bottom-0 left-0 z-50 hidden px-4 py-3 sm:block sm:p-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default text-xs text-muted-foreground tabular-nums">
            uptime: {formatDays(elapsed)}
          </span>
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
