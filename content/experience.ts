export type Job = {
  slug: string
  company: string
  role: string
  time: string
  bullets: string[]
  logo?: string // public path to a small PNG logo (e.g., /logos/companies/honeywell.png)
}

export const EXPERIENCE: Job[] = [
    {
    slug: 'esotaira-mechanical-designer-capstone',
    company: 'Esotaira',
  logo: '/logos/companies/esotaira.png',
    role: 'Capstone - Mechanical Designer',
    time: 'Aug 2025 - Dec 2025',
    bullets: [
      'Built real-time free-fall detection on embedded Linux devices (C), validated with lab drop testing.',
      'Reverse-engineered battery charger MCU interfaces (I2C, UART, 1-Wire) to preserve functionality across generations.',
      'Created Python + shell tools to analyze Bluetooth AFH data and visualize channel maps.',
      'Automated performance log parsing and visualization to streamline debugging for the electrical team.',

            'Built real-time free-fall detection on embedded Linux devices (C), validated with lab drop testing.',
      'Reverse-engineered battery charger MCU interfaces (I2C, UART, 1-Wire) to preserve functionality across generations.',
      'Created Python + shell tools to analyze Bluetooth AFH data and visualize channel maps.',
      'Automated performance log parsing and visualization to streamline debugging for the electrical team.',
            'Built real-time free-fall detection on embedded Linux devices (C), validated with lab drop testing.',
      'Reverse-engineered battery charger MCU interfaces (I2C, UART, 1-Wire) to preserve functionality across generations.',
      'Created Python + shell tools to analyze Bluetooth AFH data and visualize channel maps.',
      'Automated performance log parsing and visualization to streamline debugging for the electrical team.',
            'Built real-time free-fall detection on embedded Linux devices (C), validated with lab drop testing.',
      'Reverse-engineered battery charger MCU interfaces (I2C, UART, 1-Wire) to preserve functionality across generations.',
      'Created Python + shell tools to analyze Bluetooth AFH data and visualize channel maps.',
      'Automated performance log parsing and visualization to streamline debugging for the electrical team.'
      
    ]
  },
  {
    slug: 'honeywell-software-intern',
    company: 'Honeywell',
  logo: '/logos/companies/honeywell.png',
    role: 'Intern — Software Engineer',
    time: 'May 2025 – Aug 2025',
    bullets: [
      'Built real-time free-fall detection on embedded Linux devices (C), validated with lab drop testing.',
      'Reverse-engineered battery charger MCU interfaces (I2C, UART, 1-Wire) to preserve functionality across generations.',
      'Created Python + shell tools to analyze Bluetooth AFH data and visualize channel maps.',
      'Automated performance log parsing and visualization to streamline debugging for the electrical team.'
    ]
  },
  {
    slug: 'flourish-fullstack-mobile-intern',
    company: 'Flourish: Grow with Self-Care',
  logo: '/logos/companies/flourish.png',
    role: 'Intern — Full Stack Mobile Engineer',
    time: 'Jan 2025 – May 2025',
    bullets: [
      'Designed an animated “Plants Encyclopedia” UI in React Native with expandable cards and search.',
      'Built backend services (Appwrite + Python) merging metadata and preferences for personalized content.',
      'Partnered with product/design to ship intuitive, on-brand UI components.'
    ]
  },
  {
    slug: 'thermo-fisher-persistent-data-mentee',
    company: 'Thermo Fisher Scientific — Persistent Systems',
  logo: '/logos/companies/thermofisher.png',
    role: 'Intern — Data Engineer Mentee',
    time: 'May 2024 – Aug 2024',
    bullets: [
      'Refactored an AI Fitness Tracker with ER/Studio + SQL to align to enterprise data governance.',
      'Designed normalized schemas for scalable health metrics and nutritional analysis.',
      'Collaborated in daily syncs to iterate on data transformation best practices.'
    ]
  }
]

export function getJobBySlug(slug: string) {
  return EXPERIENCE.find((j) => j.slug === slug)
}
