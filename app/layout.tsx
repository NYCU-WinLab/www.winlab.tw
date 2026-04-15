import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"

import "./globals.css"
import { Footer } from "@/components/footer"
import { JsonLd } from "@/components/json-ld"
import { Header } from "@/components/header"
import { Uptime } from "@/components/uptime"
import { PageTransition } from "@/components/page-transition"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: {
    default: "WinLab — Wireless Internet Laboratory",
    template: "%s | WinLab",
  },
  description:
    "We deploy on Fridays. 5G/6G · Cloud-Native · AI Agents — A systems lab that builds things that actually work.",
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
    locale: "zh_TW",
    url: "https://www.winlab.tw",
    siteName: "WinLab",
    title: "WinLab — Wireless Internet Laboratory",
    description:
      "We deploy on Fridays. 5G/6G · Cloud-Native · AI Agents — A systems lab that builds things that actually work.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WinLab — Wireless Internet Laboratory",
    description:
      "We deploy on Fridays. 5G/6G · Cloud-Native · AI Agents — A systems lab that builds things that actually work.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.winlab.tw"),
}

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-TW"
      suppressHydrationWarning
      className={`${fontMono.variable} font-mono antialiased`}
    >
      <body>
        <JsonLd />
        <ThemeProvider>
          <TooltipProvider>
            <Header />
            <PageTransition>{children}</PageTransition>
            <Uptime />
            <Footer />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
