import { trace } from "@opentelemetry/api"
import type { Metadata } from "next"
import {
  Inter,
  JetBrains_Mono,
  Noto_Sans_JP,
  Noto_Sans_TC,
} from "next/font/google"
import { headers } from "next/headers"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { getClientAttributionAttributes } from "@/lib/otel/attribution"
import { cn } from "@/lib/utils"
export const metadata: Metadata = {
  title: {
    default: "WinLab: Wireless Internet Laboratory",
    template: "%s | WinLab",
  },
  description:
    "We deploy on Fridays. 5G/6G, Cloud-Native, AI Agents. A systems lab that builds things that actually work.",
  keywords: [
    "WinLab",
    "Wireless Internet Laboratory",
    "NYCU",
    "5G",
    "6G",
    "SDN",
    "NFV",
    "Cloud-Native",
    "AI Agents",
    "O-RAN",
    "Chien-Chao Tseng",
    "曾建超",
    "國立陽明交通大學",
  ],
  authors: [{ name: "WinLab, NYCU" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.winlab.tw",
    siteName: "WinLab",
    title: "WinLab: Wireless Internet Laboratory",
    description:
      "We deploy on Fridays. 5G/6G, Cloud-Native, AI Agents. A systems lab that builds things that actually work.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WinLab: Wireless Internet Laboratory",
    description:
      "We deploy on Fridays. 5G/6G, Cloud-Native, AI Agents. A systems lab that builds things that actually work.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.winlab.tw"),
}

// The font variables the WinLab base expects; the stack order lives in
// globals.css.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
})
const notoSansTc = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto-sans-tc",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Client attribution for Sensorium (see lib/otel/attribution.ts's
  // docstring for the fixed attribute-key contract). Root layout runs as a
  // Node.js Server Component, so `trace.getActiveSpan()` here is the same
  // span Sensorium receives.
  // Do NOT hoist `await headers()` into a variable. The optional chaining below
  // short-circuits when there is no active span, which is the case during
  // prerendering, so `headers()` is never evaluated at build time and the
  // marketing routes stay statically prerendered. Reading a request header
  // unconditionally here turns / and /_not-found into ƒ (Dynamic).
  trace
    .getActiveSpan()
    ?.setAttributes(getClientAttributionAttributes(await headers()))

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        inter.variable,
        notoSansJp.variable,
        notoSansTc.variable,
        jetbrainsMono.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
