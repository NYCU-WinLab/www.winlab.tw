import { Section } from "@/components/section"

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
  return (
    <Section id="research" title="Research">
      <ul className="grid stagger-rise gap-x-12 sm:grid-cols-2">
        {RESEARCH_AREAS.map((area) => (
          <li
            key={area.title}
            className="flex flex-col gap-1 border-b border-border py-4"
          >
            <h3 className="font-medium">{area.title}</h3>
            <p className="text-muted-foreground">{area.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
