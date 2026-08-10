import { createClient } from "@supabase/supabase-js"
import { writeFileSync } from "fs"

// Server/CLI-only credentials. Never inline them — read from the environment
// (see .env.example) so no key ever lands in source or git history.
const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY
if (!url || !key) {
  throw new Error(
    "Set SUPABASE_URL and SUPABASE_SECRET_KEY in scripts/.env.local, then run: bun --env-file=scripts/.env.local scripts/export-members.ts"
  )
}

const supabase = createClient(url, key)

const { data, error } = await supabase
  .from("members")
  .select("*")
  .order("role")
  .order("name")

if (error) {
  console.error("Supabase error:", error.message)
  process.exit(1)
}

if (!data || data.length === 0) {
  console.log("No members found")
  process.exit(0)
}

const cols = [
  "id",
  "name",
  "name_en",
  "email",
  "phone",
  "role",
  "position",
  "github",
  "office",
  "research_areas",
  "joined_year",
  "is_active",
  "student_id",
]

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return ""
  const str = Array.isArray(val) ? val.join(";") : String(val)
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

const rows = [
  cols.join(","),
  ...data.map((m) =>
    cols.map((c) => escapeCSV(c === "position" ? m["title"] : m[c])).join(",")
  ),
]

writeFileSync("members-export.csv", rows.join("\n"), "utf8")
console.log(`✓ Exported ${data.length} members → members-export.csv`)
