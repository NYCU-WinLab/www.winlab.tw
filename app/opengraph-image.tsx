import { ImageResponse } from "next/og"
import { readFileSync } from "node:fs"
import { join } from "node:path"

export const alt = "WinLab — Wireless Internet Laboratory"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  const logo = readFileSync(join(process.cwd(), "public/winlab-logo.png"))
  const src = `data:image/png;base64,${logo.toString("base64")}`

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        color: "#fff",
        gap: 32,
      }}
    >
      <img src={src} width={180} height={180} alt="WinLab logo" />
      <div
        style={{
          fontSize: 20,
          color: "#888",
          letterSpacing: 6,
        }}
      >
        WIRELESS INTERNET LABORATORY
      </div>
    </div>,
    size
  )
}
