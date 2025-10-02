export type Job = {
  slug: string
  company: string
  role: string
  time: string
  bullets: string[]
  logo?: string // public path to a small PNG logo (e.g., /logos/companies/honeywell.png)
  location?: string
  context?: string // optional short descriptor e.g. (Startup – ...)
}

export const EXPERIENCE: Job[] = [
  {
    slug: 'esotaira-embedded-lead-capstone',
    company: 'Esotaira',
    context: 'Startup – Military Omnidirectional UAV',
    logo: '/logos/companies/esotaira.png',
    role: 'Capstone – Embedded Software Lead',
    time: 'Aug 2025 – Present',
    location: 'University Park, PA',
    bullets: [
      'Developed embedded firmware for side-mounted omnidirectional UAV propellers with precise 0–90° tilt and dynamic thrust control, paired with a real-time web interface for remote operation, user-selectable thrust levels, and live telemetry/tilt monitoring.',
      'Integrated a carbon fiber tilt arm into a custom test rig; evaluated structural performance and durability under operational load to validate reliable full-range motion.',
      'Coordinated weekly sponsor meetings, presented engineering progress, managed materials procurement within budget, and maintained project documentation to align deliverables with stakeholder expectations.'
    ]
  },
  {
    slug: 'honeywell-software-intern',
    company: 'Honeywell',
    logo: '/logos/companies/honeywell.png',
    context: 'Industrial Automation: PSS',
    role: 'Intern – Software Engineer',
    time: 'May 2025 – Aug 2025',
    location: 'Pittsburgh, PA',
    bullets: [
      'Designed and deployed a mobile device free-fall detection feature for embedded Linux hardware (C), validating functionality via controlled drop testing and sensor trace analysis.',
      'Reverse-engineered legacy battery charger systems by capturing MCU–battery communications (I2C, UART, 1‑Wire) with Saleae logic analyzers, Perl scripts, and DMM diagnostics to ensure safe cross-generation compatibility.',
      'Created Python & shell tooling to capture Adaptive Frequency Hopping (AFH) data from Bluetooth headset connections and visualize 2D channel maps for RF interference analysis.',
      'Automated performance log parsing with a Python tool that extracts and graphs key metrics, eliminating manual triage time for the electrical engineering team.'
    ]
  },
  {
    slug: 'flourish-fullstack-mobile-intern',
    company: 'Flourish: Grow with Self-Care',
    context: 'Startup – Self-care Mobile App',
    logo: '/logos/companies/flourish.png',
    role: 'Intern – Full Stack Mobile Application Engineer',
    time: 'Jan 2025 – May 2025',
    location: 'Remote',
    bullets: [
      'Led end-to-end development of the “Plants Encyclopedia” feature: animated expandable dual-card layouts, horizontal scroll UI, and live search using React Native & JavaScript.',
      'Integrated backend services (Appwrite + Python) merging plant metadata with user preferences to deliver personalized, cross-platform content.',
      'Partnered with product & design to translate requirements into performant, accessible UI patterns aligned with brand and UX goals.'
    ]
  },
  {
    slug: 'thermo-fisher-persistent-data-mentee',
    company: 'Thermo Fisher Scientific – Persistent Systems',
    logo: '/logos/companies/thermofisher.png',
    context: 'Enterprise Data Engineering',
    role: 'Mentee / Intern – Data Engineer',
    time: 'May 2024 – Aug 2024',
    location: 'Remote',
    bullets: [
      'Refactored a personal AI fitness tracker project using ER/Studio, SQL, and Excel to align with enterprise data modeling & governance standards.',
      'Designed normalized schemas for scalable storage of health metrics, dietary inputs, and AI nutritional analysis to improve query performance and integrity.',
      'Collaborated in daily mentor syncs to refine data transformation workflows and apply best-practice reporting patterns.'
    ]
  }
]

export function getJobBySlug(slug: string) {
  return EXPERIENCE.find((j) => j.slug === slug)
}
