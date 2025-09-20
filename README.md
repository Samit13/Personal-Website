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

## Live demo: AI Fitness Tracker

- Route: `/ai-fitness-tracker`
- What it is: a client-only demo that lets you type meals in natural language (e.g., "2 eggs and toast with butter, coffee") and estimates calories, protein, carbs, and fat using a small in-browser parser. Data is stored in `localStorage` only.
- Where to change: see `app/ai-fitness-tracker/page.tsx`. The lightweight nutrition reference is defined at the top (`NDB`, `ALIASES`). Update or expand to support more foods/units.
- Project page: `/projects/ai-fitness-tracker` includes an "Open Demo" button.

## License
MIT