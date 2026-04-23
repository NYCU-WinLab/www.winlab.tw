import { createReadStream } from "fs"
import { writeFileSync } from "fs"
import { createInterface } from "readline"
import { resolve } from "path"
import { config } from "dotenv"
import KcAdminClient from "@keycloak/keycloak-admin-client"
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation.js"

config({ path: resolve(process.cwd(), ".env.local") })

const REALM = process.env.KEYCLOAK_REALM!

type CsvRow = {
  id: string
  name: string
  name_en: string
  email: string
  phone: string
  role: string
  position: string
  github: string
  office: string
  research_areas: string
  joined_year: string
  is_active: string
  student_id: string
}

async function readCsv(path: string): Promise<CsvRow[]> {
  const rl = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  })
  const rows: CsvRow[] = []
  let headers: string[] = []
  let first = true
  for await (const line of rl) {
    if (first) {
      headers = parseCsvLine(line)
      first = false
      continue
    }
    if (!line.trim()) continue
    const values = parseCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => (row[h] = values[i] ?? ""))
    rows.push(row as CsvRow)
  }
  return rows
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function buildAttributes(row: CsvRow): Record<string, string[]> {
  const attrs: Record<string, string[]> = {}
  if (row.role) attrs.role = [row.role]
  if (row.position) attrs.position = [row.position]
  if (row.phone) attrs.phone = [row.phone]
  if (row.student_id) attrs.student_id = [row.student_id]
  if (row.github) attrs.github = [row.github]
  if (row.office) attrs.office = [row.office]
  if (row.research_areas) {
    attrs.research_areas = row.research_areas
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
  }
  if (row.joined_year) attrs.admissionYear = [row.joined_year]
  return attrs
}

function escapeCSV(val: string): string {
  if (!val) return ""
  return val.includes(",") || val.includes('"') || val.includes("\n")
    ? `"${val.replace(/"/g, '""')}"`
    : val
}

async function main() {
  const csvPath = resolve(process.cwd(), "scripts/members-export.csv")
  const testMode = process.argv.includes("--test")
  const emailArg = process.argv
    .find((a) => a.startsWith("--email="))
    ?.split("=")[1]

  const kc = new KcAdminClient({
    baseUrl: process.env.KEYCLOAK_URL!,
    realmName: "master",
  })
  await kc.auth({
    grantType: "password",
    clientId: "admin-cli",
    username: process.env.KEYCLOAK_ADMIN_USERNAME!,
    password: process.env.KEYCLOAK_ADMIN_PASSWORD!,
  })
  console.log("✓ Authenticated to Keycloak")

  // Load all Keycloak users once into memory
  const kcUsers = await kc.users.find({ realm: REALM, max: 2000 })
  console.log(`✓ Loaded ${kcUsers.length} Keycloak users`)

  // Build lookup indexes
  const byEmail = new Map<string, UserRepresentation>()
  const byUsernameEmail = new Map<string, UserRepresentation>()
  const byChineseName = new Map<string, UserRepresentation>()

  for (const u of kcUsers) {
    if (u.email) byEmail.set(u.email.toLowerCase(), u)
    const attrs = (u.attributes as Record<string, string[]>) ?? {}
    const ue = attrs.username_email?.[0]
    if (ue) byUsernameEmail.set(ue.toLowerCase(), u)
    const cn = attrs.chinese_name?.[0]
    if (cn) byChineseName.set(cn, u)
  }

  const allRows = await readCsv(csvPath)
  const rows = emailArg
    ? allRows.filter((r) => r.email === emailArg)
    : testMode
      ? allRows.slice(0, 5)
      : allRows
  console.log(
    `✓ Loaded ${rows.length} CSV row(s)${testMode ? " (test mode)" : emailArg ? ` (email=${emailArg})` : ""}`
  )

  const updated: string[] = []
  const unmatched: CsvRow[] = []
  const matchLog: string[] = []

  for (const row of rows) {
    // Three-level matching
    let kcUser: UserRepresentation | undefined
    let matchedBy = ""

    if (row.email) {
      kcUser = byEmail.get(row.email.toLowerCase())
      if (kcUser) matchedBy = "email"
    }
    if (!kcUser && row.email) {
      kcUser = byUsernameEmail.get(row.email.toLowerCase())
      if (kcUser) matchedBy = "username_email"
    }
    if (!kcUser && row.name) {
      kcUser = byChineseName.get(row.name)
      if (kcUser) matchedBy = "chinese_name"
    }

    if (!kcUser) {
      unmatched.push(row)
      continue
    }

    const existingAttrs = (kcUser.attributes as Record<string, string[]>) ?? {}
    const newAttrs = buildAttributes(row)
    const mergedAttrs = { ...existingAttrs, ...newAttrs }

    // Set chinese_name if not set
    if (row.name && !existingAttrs.chinese_name?.[0]) {
      mergedAttrs.chinese_name = [row.name]
    }

    // Start from existing user to avoid PUT clearing unset fields
    const updatePayload: Record<string, unknown> = {
      ...kcUser,
      attributes: mergedAttrs,
    }

    // Fill email if missing
    if (!kcUser.email && row.email) {
      updatePayload.email = row.email
      updatePayload.emailVerified = true
    }

    // Restore firstName/lastName if missing (cleared by previous bug)
    if (!kcUser.firstName) {
      if (row.name_en) {
        const parts = row.name_en.trim().split(/\s+/)
        updatePayload.firstName =
          parts.length >= 2 ? parts.slice(0, -1).join(" ") : row.name_en
        if (parts.length >= 2) updatePayload.lastName = parts[parts.length - 1]
      } else if (row.name && /[一-鿿]/.test(row.name)) {
        // Chinese name: first char = surname, rest = given name
        updatePayload.lastName = row.name.slice(0, 1)
        updatePayload.firstName = row.name.slice(1)
      }
    }

    await kc.users.update({ id: kcUser.id!, realm: REALM }, updatePayload)

    updated.push(row.email || row.name)
    matchLog.push(
      `[${matchedBy}] ${row.name} (${row.email}) → ${kcUser.username}`
    )

    if (updated.length % 10 === 0) {
      console.log(`  ↳ Updated ${updated.length}…`)
    }
  }

  console.log(`\n✓ Updated ${updated.length} users`)
  matchLog.forEach((l) => console.log("  " + l))

  console.log(`\n✗ ${unmatched.length} unmatched`)

  if (unmatched.length > 0) {
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
    const lines = [
      cols.join(","),
      ...unmatched.map((r) =>
        cols.map((c) => escapeCSV(r[c as keyof CsvRow])).join(",")
      ),
    ]
    const outPath = resolve(process.cwd(), "scripts/unmatched-members.csv")
    writeFileSync(outPath, lines.join("\n"), "utf8")
    console.log(`✓ Saved → scripts/unmatched-members.csv`)
  }
}

main().catch((err) => {
  console.error("Error:", err.message ?? err)
  process.exit(1)
})
