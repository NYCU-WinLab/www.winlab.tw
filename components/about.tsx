"use client"

import Image from "next/image"
import { motion } from "motion/react"

import { useInView } from "@/hooks/use-in-view"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

export function About() {
  const { ref, inView } = useInView()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="flex h-dvh flex-col items-center justify-center gap-8 px-6 text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0 }}
        className="text-sm tracking-widest text-muted-foreground uppercase"
      >
        Wireless Internet Laboratory
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.1 }}
        className="text-3xl font-medium"
      >
        We deploy on Fridays.
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ ...spring, delay: 0.2 }}
      >
        <Image
          src="/this-is-fine.webp"
          alt="This is fine"
          width={320}
          height={180}
          className="w-full max-w-xs rounded-lg sm:max-w-sm"
        />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.3 }}
        className="text-sm tracking-wide text-muted-foreground"
      >
        5G/6G · Cloud-Native · AI Agents
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.4 }}
        className="text-center text-base text-muted-foreground"
      >
        A systems lab that builds things that actually work.
      </motion.p>
    </section>
  )
}
