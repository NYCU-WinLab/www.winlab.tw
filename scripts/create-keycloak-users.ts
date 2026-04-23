import { createReadStream } from "fs"
import { createInterface } from "readline"
import { resolve } from "path"
import { config } from "dotenv"
import KcAdminClient from "@keycloak/keycloak-admin-client"

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
      } else inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else current += ch
  }
  result.push(current)
  return result
}

function makeUsername(email: string, existing: Set<string>): string {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
  let candidate = base
  let n = 2
  while (existing.has(candidate)) candidate = `${base}${n++}`
  return candidate
}

function buildNames(row: CsvRow) {
  if (row.name_en) {
    const parts = row.name_en.trim().split(/\s+/)
    return {
      firstName: parts.length >= 2 ? parts.slice(0, -1).join(" ") : row.name_en,
      lastName: parts.length >= 2 ? parts[parts.length - 1] : "",
    }
  }
  if (row.name && /[一-鿿]/.test(row.name)) {
    return { firstName: row.name.slice(1), lastName: row.name.slice(0, 1) }
  }
  return { firstName: row.name, lastName: "" }
}

function buildAttributes(row: CsvRow): Record<string, string[]> {
  const attrs: Record<string, string[]> = {}
  if (row.name) attrs.chinese_name = [row.name]
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

async function main() {
  const testMode = process.argv.includes("--test")

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

  // Load existing users to build username/email conflict sets
  const existing = await kc.users.find({ realm: REALM, max: 2000 })
  const existingUsernames = new Set(
    existing.map((u) => u.username!).filter(Boolean)
  )
  const existingEmails = new Set(
    existing.map((u) => u.email?.toLowerCase()).filter(Boolean) as string[]
  )
  console.log(`✓ Loaded ${existing.length} existing users`)

  const allRows = await readCsv(
    resolve(process.cwd(), "scripts/unmatched-members.csv")
  )
  const rows = testMode ? allRows.slice(0, 3) : allRows
  console.log(
    `✓ Loaded ${rows.length} unmatched member(s)${testMode ? " (test mode)" : ""}`
  )

  let created = 0
  let skipped = 0
  const skippedList: string[] = []

  for (const row of rows) {
    if (!row.email) {
      skippedList.push(`${row.name} — no email`)
      skipped++
      continue
    }

    // Skip if email already exists (safety check)
    if (existingEmails.has(row.email.toLowerCase())) {
      skippedList.push(`${row.name} (${row.email}) — email already exists`)
      skipped++
      continue
    }

    const username = makeUsername(row.email, existingUsernames)
    existingUsernames.add(username)
    existingEmails.add(row.email.toLowerCase())

    const { firstName, lastName } = buildNames(row)

    await kc.users.create({
      realm: REALM,
      username,
      email: row.email,
      emailVerified: true,
      enabled: true,
      firstName,
      lastName,
      attributes: buildAttributes(row),
      requiredActions: [],
    })

    created++
    console.log(`  + ${row.name} (${row.email}) → ${username}`)

    if (created % 20 === 0) console.log(`  ↳ Created ${created}…`)
  }

  console.log(`\n✓ Created ${created} users`)
  if (skipped > 0) {
    console.log(`  Skipped ${skipped}:`)
    skippedList.forEach((s) => console.log("   -", s))
  }
}

main().catch((err) => {
  console.error("Error:", err.message ?? err)
  process.exit(1)
})
