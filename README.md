# Samit Madatanapalli — Portfolio (Next.js + Tailwind + Three.js + GSAP)

A modern, minimal, scroll-driven portfolio inspired by Apple.com. Features a glossy "liquid glass" WebGL hero (with static fallback), buttery scroll storytelling, and accessible, responsive design.

## Stack
- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger
- Three.js + GLSL shader

## Quick start

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000

## Content
Replace placeholders in `app/(site)/page.tsx` and in components under `components/`.

## Deployment checklist
- Build: `pnpm build`
- Deploy to Vercel (recommended) or any Node host
- Ensure images are optimized (Next/Image) and external domains configured in `next.config.mjs`
- Verify `prefers-reduced-motion` behavior and keyboard navigation
- Confirm WebGL loads lazily and clamps DPR ≤ 1.5 (see `useWebGL.ts`)

## License
MIT