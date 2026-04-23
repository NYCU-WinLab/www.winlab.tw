"use client"

import { motion } from "motion/react"

import { useInView } from "@/hooks/use-in-view"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

export function FindUs() {
  const { ref, inView } = useInView()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="flex h-dvh flex-col items-center justify-center gap-8 px-6 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={spring}
        className="text-2xl font-medium sm:text-3xl"
      >
        Find the Lab
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.1 }}
        className="text-sm text-muted-foreground"
      >
        Engineering Building C, Room 638 — 6F, right, then right again.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ ...spring, delay: 0.2 }}
        className="w-full max-w-3xl overflow-hidden rounded-lg"
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d904.0661854348498!2d120.9967689!3d24.7869837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3468360f96adabd7%3A0xedfd1ba0fa6c6bf7!2z5ZyL56uL6Zm95piO5Lqk6YCa5aSn5a24IOW3peeoi-S4iemkqA!5e0!3m2!1szh-TW!2stw!4v1712345678901!5m2!1szh-TW!2stw"
          width="100%"
          height="350"
          style={{ border: 0, filter: "grayscale(1) invert(0.92)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[200px] sm:h-[350px] dark:hue-rotate-180 dark:invert"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.3 }}
        className="flex flex-col gap-1 text-xs text-muted-foreground"
      >
        <span>No. 1001, Daxue Rd., East Dist., Hsinchu City 300093</span>
        <span>National Yang Ming Chiao Tung University</span>
      </motion.div>
    </section>
  )
}
