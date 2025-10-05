import fs from 'fs/promises'
import path from 'path'
import { curatedPhotos, MAX_MOSAIC, MAX_RECENT } from '@/content/photos'
import PhotoShowcaseClient from './PhotoShowcaseClient'

export interface ShowcaseData {
  mosaic: string[]
  recent: string[]
}

export default async function PhotoShowcase() {
  const dir = path.join(process.cwd(), 'public', 'photos')
  let all: string[] = []
  try {
    const files = await fs.readdir(dir)
    all = files
      .filter(f => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
  } catch {
    all = []
  }
  if (all.length === 0) return null

  // Curated mosaic: only include files that actually exist
  const mosaic = curatedPhotos.filter(f => all.includes(f)).slice(0, MAX_MOSAIC)
  const mosaicSet = new Set(mosaic)
  // Recent (excluding curated) - take last N (assuming numeric ascending = chronological)
  const recentCandidates = all.filter(f => !mosaicSet.has(f)).slice(-MAX_RECENT)
  // Map to public paths
  const toUrl = (n: string) => `/photos/${n}`
  const data: ShowcaseData = {
    mosaic: mosaic.map(toUrl),
    recent: recentCandidates.map(toUrl)
  }

  return (
    <section id="photography" aria-labelledby="photography-title" className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
      <header className="mb-14 text-center">
        <h2 id="photography-title" className="text-3xl md:text-5xl font-semibold tracking-tight title-glow">Photography</h2>
        <div className="mt-6 flex justify-center">
          <a
            href="https://www.instagram.com/samit.shots/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 pl-5 pr-8 py-2.5 text-sm font-medium leading-none text-white shadow-lg shadow-pink-500/25 ring-1 ring-white/15 transition hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span className="flex h-4 w-4 items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 drop-shadow-[0_0_4px_rgba(255,255,255,0.45)]">
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7.25a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5Zm0 1.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Zm5.25-.9a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z"/>
              </svg>
            </span>
            <span className="font-semibold tracking-wide">samit.shots</span>
            <span className="pointer-events-none absolute right-3 translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100">→</span>
          </a>
        </div>
      </header>
      <PhotoShowcaseClient data={data} />
    </section>
  )
}

