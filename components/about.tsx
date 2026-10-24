import Image from "next/image"

import { Focus, FocusLabel, FocusMeta, FocusTitle } from "@/components/focus"

// The page's one loud thing: who we are, in a line.
export function About() {
  return (
    <Focus className="items-center pb-24 text-center">
      <FocusLabel>Wireless Internet Laboratory</FocusLabel>
      <FocusTitle>We deploy on Fridays.</FocusTitle>
      <Image
        src="/this-is-fine.webp"
        alt="This is fine"
        width={320}
        height={180}
        className="w-full max-w-xs rounded-control sm:max-w-sm"
      />
      <FocusMeta className="justify-center">
        <span>5G/6G</span>
        <span>Cloud-Native</span>
        <span>AI Agents</span>
      </FocusMeta>
      <p className="text-muted-foreground">
        A systems lab that builds things that actually work.
      </p>
      <p className="text-muted-foreground">
        P.S. We also run NYCU&apos;s{" "}
        <a
          href="https://ai.winlab.tw"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 transition-colors duration-state hover:text-foreground"
        >
          Office of AI Affairs, 人工智慧專責辦公室
        </a>
        .
      </p>
    </Focus>
  )
}
