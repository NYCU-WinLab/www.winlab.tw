import { ExternalLink, Mail, MapPin } from "lucide-react"
import Image from "next/image"

import { CenteredSection } from "@/components/centered-section"
import { Badge } from "@/components/ui/badge"

const RESEARCH = [
  "SDN / NFV",
  "5G / 6G Networks",
  "Cloud-Native",
  "AI Agents",
  "O-RAN",
  "DevOps & CI/CD",
]

export function Professor() {
  return (
    <CenteredSection title="Professor">
      <Image
        src="/professor.png"
        alt="Prof. Chien-Chao Tseng"
        width={160}
        height={160}
        className="size-40 rounded-full object-cover object-top"
      />
      <div>
        <h3 className="text-title font-medium">Chien-Chao Tseng</h3>
        <p className="text-muted-foreground">
          曾建超, Distinguished Professor, NYCU
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {RESEARCH.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <a
          href="mailto:cctseng@cs.nycu.edu.tw"
          className="flex items-center gap-2 transition-colors duration-state hover:text-foreground"
        >
          <Mail className="size-4" />
          cctseng@cs.nycu.edu.tw
        </a>
        <span className="flex items-center gap-2">
          <MapPin className="size-4" />
          Engineering Building C, Room 626
        </span>
        <a
          href="https://sites.google.com/view/cctseng"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 transition-colors duration-state hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          Personal Website
        </a>
      </div>
    </CenteredSection>
  )
}
