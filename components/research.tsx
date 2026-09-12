"use client"

import * as m from "motion/react-m"

import { useInView } from "@/hooks/use-in-view"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

// Sourced from Prof. Tseng's research interests and project list
// (https://sites.google.com/view/cctseng). Keep json-ld.tsx's knowsAbout in
// step when this changes.
export const RESEARCH_AREAS = [
  {
    title: "SDN and NFV",
    description:
      "Programmable data planes and virtualised network functions, from software-defined WAN CPEs to multi-cluster CNF placement.",
  },
  {
    title: "5G/6G Management and Orchestration",
    description:
      "O-RAN compliant, intent-based MANO for end-to-end network slicing across distributed clouds.",
  },
  {
    title: "Hardware Acceleration for B5G/6G",
    description:
      "DPDK and P4 offload for CU-UP, UPF and AGF user planes, with bandwidth control in the fast path.",
  },
  {
    title: "Cloud-Native, DevOps and CI/CD",
    description:
      "Infrastructure as Code and GitOps pipelines that provision reliable Kubernetes clusters for telecom workloads.",
  },
  {
    title: "AI Agents and AgentOps",
    description:
      "Autonomous agents that operate network infrastructure, and the tooling needed to run them in production.",
  },
  {
    title: "Satellite and Non-3GPP Access",
    description:
      "Satellite network management and trusted non-3GPP access (TWAN, WWC) integrated with the 5G core.",
  },
]

export function Research() {
  const { ref, inView } = useInView()

  return (
    <section
      id="research"
      ref={ref as React.RefObject<HTMLElement>}
      className="flex min-h-dvh flex-col items-center justify-center gap-10 px-6 py-16 text-center"
    >
      <div className="flex flex-col items-center gap-3">
        <m.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={spring}
          className="text-sm tracking-widest text-muted-foreground uppercase"
        >
          Research
        </m.p>
        <m.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...spring, delay: 0.1 }}
          className="text-2xl font-medium sm:text-3xl"
        >
          What we build
        </m.h2>
      </div>

      <div className="grid w-full max-w-4xl gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {RESEARCH_AREAS.map((area, i) => (
          <m.article
            key={area.title}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...spring, delay: 0.2 + i * 0.05 }}
            className="flex flex-col gap-2 rounded-lg border border-border p-5"
          >
            <h3 className="text-sm font-medium">{area.title}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {area.description}
            </p>
          </m.article>
        ))}
      </div>
    </section>
  )
}
