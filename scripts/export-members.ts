import { createClient } from "@supabase/supabase-js"
import { writeFileSync } from "fs"

const supabase = createClient(
  "https://yissfqcdmzsxwfnzrflz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpc3NmcWNkbXpzeHdmbnpyZmx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc3ODUxOSwiZXhwIjoyMDgxMzU0NTE5fQ.fMRf99wNOCBtr8Mze9zApWmSU54bM_hu_UA8FcI9Nx4"
)

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
