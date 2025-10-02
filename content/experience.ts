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
    role: 'Intern - Software Engineer',
    time: 'May 2025 – Aug 2025',
    bullets: [
      'Designed and deployed a mobile device free fall feature for the Honeywell embedded Linux devices, implementing real-time sensor processing in C and validating functionality through drop testing using specialized equipment',
      'Reverse-engineered legacy battery charger systems by analyzing MCU-to-battery communication (I2C, UART, 1-Wire) using Saleae logic analyzers, Perl scripts, and DMM, enabling preservation of critical functionality in next-generation chargers and ensuring safe, reliable operation with both new and legacy batteries',
      'Developed Python and shell scripts to capture Adaptive Frequency Hopping (AFH) data from a Honeywell Bluetooth headset connection and convert logs into 2D channel map visualizations, supporting efforts to understand RF behavior behind a major customer-reported connectivity issue',
      'Automated performance log analysis by building a Python tool to extract and visualize performance metrics from Honeywell embedded Linux device logs, streamlining debugging workflows and eliminating manual analysis for the electrical team'
    ]
  },
  {
    slug: 'flourish-fullstack-mobile-intern',
    company: 'Flourish: Grow with Self-Care',
  logo: '/logos/companies/flourish.png',
    role: 'Intern - Full Stack Mobile Application Engineer',
    time: 'Jan 2025 – May 2025',
    bullets: [
      'Led end-to-end development of the “Plants Encyclopedia” screen, crafting an animated, interactive UI with expandable dual-card layouts, horizontal scrollable selections, and a live search bar using JavaScript and React Native',
      'Built and integrated backend services with Appwrite and Python, merging plant metadata and user preferences to deliver dynamic, personalized content across platforms',
      'Collaborated closely with product and design teams to translate feature requirements into intuitive user interfaces, ensuring alignment with the app’s visual identity and user experience goals'
    ]
  },
  {
    slug: 'thermo-fisher-persistent-data-mentee',
    company: 'Thermo Fisher Scientific: Persistent Systems',
  logo: '/logos/companies/thermofisher.png',
    role: 'Intern - Data Engineer Mentee',
    time: 'May 2024 – Aug 2024',
    bullets: [
      'Refactored and optimized my personal AI Fitness Tracker project using enterprise-grade tools like ER/Studio, SQL, and Excel to align with professional data modeling and governance standards',
      'Designed normalized database schemas to support scalable storage of user health metrics, dietary inputs, and AI-generated nutritional analysis, improving query efficiency and data integrity',
      'Collaborated with mentors in daily syncs to refine workflows and apply best practices in data transformation and reporting'
    ]
  }
]

export function getJobBySlug(slug: string) {
  return EXPERIENCE.find((j) => j.slug === slug)
}
