/**
 * Guards lib/csp.mjs's THEME_SCRIPT_HASH against silent drift.
 *
 * The /directory CSP allow-lists next-themes' pre-paint inline script by hash
 * (it can't be nonced without costing static prerendering — see lib/csp.mjs).
 * Upgrading next-themes or changing ThemeProvider's props changes that script,
 * and the only symptom in production would be a light-mode flash on /directory.
 * This turns that into a build failure instead.
 *
 * Run after `bun run build`. CI does both.
 */

import { createHash } from "node:crypto"
import { readFileSync, existsSync } from "node:fs"
import { THEME_SCRIPT_HASH } from "../lib/csp.mjs"

const BUILT_HTML = ".next/server/app/index.html"

if (!existsSync(BUILT_HTML)) {
  console.error(
    `verify:csp-hash: ${BUILT_HTML} not found — run \`bun run build\` first.`
  )
  process.exit(1)
}

const html = readFileSync(BUILT_HTML, "utf8")

// Inline <script> tags only (no src=). next-themes' is the one that reaches for
// document.documentElement before paint.
const inlineScripts = [
  ...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g),
].map((match) => match[1])

const themeScripts = inlineScripts.filter((body) =>
  body.includes("document.documentElement")
)

if (themeScripts.length !== 1) {
  console.error(
    `verify:csp-hash: expected exactly 1 inline theme script in ${BUILT_HTML}, found ${themeScripts.length}.`,
    "\nEither next-themes changed shape, or another inline script now touches document.documentElement.",
    "\nInspect the build output before touching the hash."
  )
  process.exit(1)
}

const actual = `sha256-${createHash("sha256").update(themeScripts[0]).digest("base64")}`

if (actual !== THEME_SCRIPT_HASH) {
  console.error(
    "verify:csp-hash: next-themes' inline script changed.",
    `\n  expected: ${THEME_SCRIPT_HASH}`,
    `\n  actual:   ${actual}`,
    "\n\nUpdate THEME_SCRIPT_HASH in lib/csp.mjs to the actual value above.",
    "\nLeaving it stale would block the theme script on /directory (light-mode flash)."
  )
  process.exit(1)
}

console.log(`verify:csp-hash: ok (${actual})`)
