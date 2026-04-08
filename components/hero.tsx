"use client"

import { useCallback, useEffect, useRef } from "react"
import { useTheme } from "next-themes"

import heroData from "@/lib/hero-data.json"

const CHARSET = ".:-=+*#%@"

type CharData = {
  row: number
  col: number
  r: number
  g: number
  b: number
  ch: string
  density: number
}

const chars: CharData[] = (
  heroData.chars as [number, number, number, number, number, string][]
).map(([row, col, r, g, b, ch]) => ({
  row,
  col,
  r,
  g,
  b,
  ch,
  density: CHARSET.indexOf(ch),
}))

const ROWS = heroData.rows as number
const COLS = heroData.cols as number

// glitch state: char index → { char, expires }
const glitchMap = new Map<number, { ch: string; expires: number }>()

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const { resolvedTheme } = useTheme()
  const themeRef = useRef(resolvedTheme)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    themeRef.current = resolvedTheme
  }, [resolvedTheme])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const isLight = themeRef.current === "light"
    const bg = getComputedStyle(canvas.parentElement!).backgroundColor
    ctx.fillStyle = bg || (isLight ? "#ffffff" : "#000000")
    ctx.fillRect(0, 0, rect.width, rect.height)

    // square cells — original SVG uses 12x12 grid
    const cellSize = Math.min(
      rect.width / (COLS + 4),
      rect.height / (ROWS + 4)
    )
    const cellW = cellSize
    const cellH = cellSize

    const fontSize = cellH * 0.9
    ctx.font = `${fontSize}px monospace`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const totalW = COLS * cellW
    const totalH = ROWS * cellH
    const offsetX = (rect.width - totalW) / 2
    const offsetY = (rect.height - totalH) / 2

    const now = performance.now() / 1000
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    for (let i = 0; i < chars.length; i++) {
      const c = chars[i]
      const x = offsetX + (c.col + 0.5) * cellW
      const y = offsetY + (c.row + 0.5) * cellH

      // wave: slow character density oscillation
      const wave = Math.sin(c.col * 0.4 + c.row * 0.3 + now * 0.7) * 1.5

      // mouse proximity — star/cross shaped falloff
      const dx = mx - x
      const dy = my - y
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      const dist = Math.sqrt(dx * dx + dy * dy)
      const radius = 120

      // cross arms: boost influence along horizontal & vertical axes
      const armWidth = 20
      const onHorizontal = absDy < armWidth ? 1 - absDy / armWidth : 0
      const onVertical = absDx < armWidth ? 1 - absDx / armWidth : 0
      const crossBoost = Math.max(onHorizontal, onVertical)

      // blend radial falloff with cross shape
      const radial = Math.max(0, 1 - dist / radius)
      const influence = Math.min(1, radial * 0.4 + crossBoost * Math.max(0, 1 - dist / (radius * 1.8)))

      // character shift: wave + mouse boost density
      const shift = wave + influence * 3
      const newDensity = Math.max(
        0,
        Math.min(CHARSET.length - 1, Math.round(c.density + shift))
      )
      let ch = CHARSET[newDensity]

      // glitch: trigger rarely, hold for ~0.5s
      const existing = glitchMap.get(i)
      if (existing && now < existing.expires) {
        ch = existing.ch
      } else if (Math.random() < 0.00005) {
        const glitchCh = CHARSET[Math.floor(Math.random() * CHARSET.length)]
        glitchMap.set(i, { ch: glitchCh, expires: now + 0.3 + Math.random() * 0.4 })
        ch = glitchCh
      } else if (existing) {
        glitchMap.delete(i)
      }

      // color — both themes use blue/purple tones
      let { r, g, b } = c
      if (isLight) {
        // darken the original blue/purple for white bg
        r = Math.round(r * 0.3)
        g = Math.round(g * 0.3)
        b = Math.round(b * 0.7)
      }

      // mouse glow
      if (influence > 0) {
        if (isLight) {
          r = Math.round(r * (1 - influence * 0.5) + 60 * influence * 0.5)
          g = Math.round(g * (1 - influence * 0.5) + 30 * influence * 0.5)
          b = Math.round(b * (1 - influence * 0.5) + 200 * influence * 0.5)
        } else {
          r = Math.min(255, Math.round(r + (255 - r) * influence * 0.4))
          g = Math.min(255, Math.round(g + (255 - g) * influence * 0.2))
          b = Math.min(255, Math.round(b + 80 * influence))
        }
      }

      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillText(ch, x, y)
    }

    rafRef.current = requestAnimationFrame(render)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [render])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const onMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 }
  }, [])

  return (
    <section className="animate-fade-in relative h-dvh bg-background">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
    </section>
  )
}
