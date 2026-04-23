"use client"

import { ExternalLink, Mail, MapPin } from "lucide-react"
import Image from "next/image"
import { motion } from "motion/react"

import { useInView } from "@/hooks/use-in-view"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

const RESEARCH = [
  "SDN / NFV",
  "5G / 6G Networks",
  "Cloud-Native",
  "AI Agents",
  "O-RAN",
  "DevOps & CI/CD",
]

export function Professor() {
  const { ref, inView } = useInView()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="flex h-dvh items-center justify-center px-6"
    >
      <div className="flex max-w-3xl flex-col items-center gap-10 md:flex-row md:items-start md:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ ...spring }}
          className="shrink-0"
        >
          <Image
            src="/professor.png"
            alt="Prof. Chien-Chao Tseng"
            width={240}
            height={240}
            className="h-36 w-36 rounded-full object-cover sm:h-60 sm:w-60"
          />
        </motion.div>

        <div className="flex flex-col items-center gap-6 md:items-start">
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ ...spring, delay: 0.1 }}
          >
            <h2 className="text-center text-2xl font-medium sm:text-4xl md:text-left">
              Chien-Chao Tseng
            </h2>
            <p className="mt-2 text-center text-base text-muted-foreground md:text-left">
              曾建超 — Distinguished Professor, NYCU
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            {RESEARCH.map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...spring, delay: 0.2 + i * 0.05 }}
                className="rounded-full border border-border px-4 py-1.5 text-sm"
              >
                {tag}
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...spring, delay: 0.5 }}
            className="flex flex-col items-center gap-2 text-sm text-muted-foreground md:items-start"
          >
            <a
              href="mailto:cctseng@cs.nycu.edu.tw"
              className="flex items-center gap-2 hover:text-foreground"
            >
              <Mail className="size-3.5" />
              cctseng@cs.nycu.edu.tw
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="size-3.5" />
              Engineering Building C, Room 626
            </span>
            <a
              href="https://sites.google.com/view/cctseng"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
              Personal Website
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
