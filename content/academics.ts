export type AcademicKind = 'project' | 'assignment' | 'essay' | 'thesis'

export type AcademicItem = {
  kind: AcademicKind
  slug: string
  title: string
  description?: string
  course?: string
  term?: string
  link?: string
}

export const featuredAcademics: AcademicItem[] = [
  {
    kind: 'thesis',
    slug: 'senior-thesis-embedded-vision-riscv',
    title: 'Senior Thesis: Real‑Time Embedded Vision on RISC‑V',
    description: 'Optimized image pipelines on a soft RISC‑V core with DMA; >3× speedup vs baseline.',
    course: 'ECE 4xx',
    term: 'Spring 2025',
    link: '#'
  },
  {
    kind: 'project',
    slug: 'pipelined-mips-cpu-5-stage',
    title: 'Pipelined MIPS CPU (5‑stage)',
    description: 'Hazard detection/forwarding, branch prediction; verified with waveform suites in Vivado.',
    course: 'ECE 350',
    term: 'Fall 2024',
    link: '#'
  },
  {
    kind: 'assignment',
    slug: 'allocator-from-scratch',
    title: 'Allocator from Scratch',
    description: 'Buddy allocator in C with coalescing; unit tests and perf harness.',
    course: 'CS 341 (OS)',
    term: 'Fall 2024',
    link: '#'
  },
  {
    kind: 'essay',
    slug: 'ethics-of-autonomous-systems',
    title: 'Ethics of Autonomous Systems',
    description: 'Policy analysis on safety envelopes and accountability for AVs.',
    course: 'STS 210',
    term: 'Spring 2024',
    link: '#'
  }
]

export function getAcademicBySlug(slug: string): AcademicItem | undefined {
  return featuredAcademics.find(a => a.slug === slug)
}
