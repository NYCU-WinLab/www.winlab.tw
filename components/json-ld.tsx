export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ResearchOrganization",
    name: "WinLab — Wireless Internet Laboratory",
    url: "https://www.winlab.tw",
    description:
      "A systems lab at NYCU focused on 5G/6G infrastructure, cloud-native platforms, and AI-powered network automation.",
    foundingDate: "1989",
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "National Yang Ming Chiao Tung University",
      alternateName: "NYCU",
      url: "https://www.nycu.edu.tw",
    },
    member: {
      "@type": "Person",
      name: "Chien-Chao Tseng",
      jobTitle: "Distinguished Professor",
      email: "cctseng@cs.nycu.edu.tw",
      url: "https://sites.google.com/view/cctseng",
    },
    knowsAbout: [
      "Software Defined Networking",
      "Network Function Virtualization",
      "5G/6G Management and Orchestration",
      "O-RAN",
      "Network Slicing",
      "Hardware Acceleration (DPDK, P4)",
      "Cloud-Native",
      "DevOps and CI/CD",
      "AI Agents and AgentOps",
      "Satellite Network Management",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hsinchu",
      addressCountry: "TW",
      streetAddress: "Engineering Building C, Room 638",
    },
  }

  // static hardcoded data — safe to inject directly
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
