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
      "5G Networks",
      "6G Networks",
      "Software Defined Networking",
      "Network Function Virtualization",
      "Cloud-Native",
      "AI Agents",
      "O-RAN",
      "DevOps",
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
