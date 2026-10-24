"use client"

import { useState } from "react"
import { ExternalLink, MapPin } from "lucide-react"
import { Section } from "@/components/section"
import { Button, buttonVariants } from "@/components/ui/button"

const LAT = 24.7869837
const LNG = 120.9967689

const EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d904.0661854348498!2d120.9967689!3d24.7869837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3468360f96adabd7%3A0xedfd1ba0fa6c6bf7!2z5ZyL56uL6Zm95piO5Lqk6YCa5aSn5a24IOW3peeoi-S4iemkqA!5e0!3m2!1szh-TW!2stw!4v1712345678901!5m2!1szh-TW!2stw"

const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`

/**
 * The Google Maps embed pulls in roughly 450 KiB of script on its own, more
 * than the rest of the page combined, for a section most visitors never
 * scroll to. It is mounted only when the visitor asks for it.
 */
function MapEmbed() {
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <iframe
        title="WinLab location on Google Maps"
        src={EMBED_SRC}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-80 w-full rounded-control border-0 grayscale dark:hue-rotate-180 dark:invert"
      />
    )
  }

  return (
    <Button variant="outline" onClick={() => setLoaded(true)}>
      <MapPin />
      Show map
    </Button>
  )
}

export function FindUs() {
  return (
    <Section id="find-us" title="Find the Lab">
      <div className="flex flex-col gap-1">
        <p>Engineering Building C, Room 638. 6F, right, then right again.</p>
        <p className="text-muted-foreground">
          No. 1001, Daxue Rd., East Dist., Hsinchu City 300093
        </p>
        <p className="text-muted-foreground">
          National Yang Ming Chiao Tung University
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline" })}
        >
          <ExternalLink />
          Open in Google Maps
        </a>
      </div>
      <MapEmbed />
    </Section>
  )
}
