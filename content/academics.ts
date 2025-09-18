export type AcademicKind = 'project' | 'assignment' | 'essay' | 'thesis'

export type AcademicItem = {
  kind: AcademicKind
  title: string
  description?: string
  course?: string
  term?: string
  link?: string
}

export const featuredAcademics: AcademicItem[] = [
  {
    kind: 'thesis',
    title: 'Senior Thesis: Real‑Time Embedded Vision on RISC‑V',
    description: 'Optimized image pipelines on a soft RISC‑V core with DMA; >3× speedup vs baseline.',
    course: 'ECE 4xx',
    term: 'Spring 2025',
    link: '#'
  },
  {
    kind: 'project',
    title: 'Pipelined MIPS CPU (5‑stage)',
    description: 'Hazard detection/forwarding, branch prediction; verified with waveform suites in Vivado.',
    course: 'ECE 350',
    term: 'Fall 2024',
    link: '#'
  },
  {
    kind: 'assignment',
    title: 'Allocator from Scratch',
    description: 'Buddy allocator in C with coalescing; unit tests and perf harness.',
    course: 'CS 341 (OS)',
    term: 'Fall 2024',
    link: '#'
  },
  {
    kind: 'essay',
    title: 'Ethics of Autonomous Systems',
    description: 'Policy analysis on safety envelopes and accountability for AVs.',
    course: 'STS 210',
    term: 'Spring 2024',
    link: '#'
  }
]
