"use client"

import { useState } from "react"
import { ExternalLink, MapPin } from "lucide-react"
import * as m from "motion/react-m"

import { useInView } from "@/hooks/use-in-view"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

const LAT = 24.7869837
const LNG = 120.9967689

const EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d904.0661854348498!2d120.9967689!3d24.7869837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3468360f96adabd7%3A0xedfd1ba0fa6c6bf7!2z5ZyL56uL6Zm95piO5Lqk6YCa5aSn5a24IOW3peeoi-S4iemkqA!5e0!3m2!1szh-TW!2stw!4v1712345678901!5m2!1szh-TW!2stw"

const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`

/**
 * The Google Maps embed pulls in roughly 450 KiB of script on its own, more
 * than the rest of the page combined, for a section most visitors never
 * scroll to. It is mounted only on demand; until then a static placeholder
 * with the same footprint keeps the layout stable.
 */
function MapEmbed() {
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <iframe
        title="WinLab location on Google Maps"
        src={EMBED_SRC}
        width="100%"
        height="350"
        style={{ border: 0, filter: "grayscale(1) invert(0.92)" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-[200px] sm:h-[350px] dark:hue-rotate-180 dark:invert"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/20 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground sm:h-[350px]"
    >
      <MapPin className="size-5" />
      <span>Load interactive map</span>
      <span className="text-xs text-muted-foreground">Embeds Google Maps</span>
    </button>
  )
}

export function FindUs() {
  const { ref, inView } = useInView()

  return (
    <section
      id="find-us"
      ref={ref as React.RefObject<HTMLElement>}
      className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-16 text-center sm:gap-8 sm:py-0"
    >
      <m.h2
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={spring}
        className="text-2xl font-medium sm:text-3xl"
      >
        Find the Lab
      </m.h2>
      <m.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.1 }}
        className="text-sm text-muted-foreground"
      >
        Engineering Building C, Room 638. 6F, right, then right again.
      </m.p>
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ ...spring, delay: 0.2 }}
        className="w-full max-w-3xl overflow-hidden rounded-lg"
      >
        <MapEmbed />
      </m.div>
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.3 }}
        className="flex flex-col items-center gap-1 text-xs text-muted-foreground"
      >
        <span>No. 1001, Daxue Rd., East Dist., Hsinchu City 300093</span>
        <span>National Yang Ming Chiao Tung University</span>
        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <ExternalLink className="size-3" />
          Open in Google Maps
        </a>
      </m.div>
    </section>
  )
}
