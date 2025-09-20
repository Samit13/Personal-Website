import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PROJECTS, getProjectBySlug, type MediaItem } from '@/content/projects'
import VideoHero from '@/components/VideoHero'
import Reveal from '@/components/Reveal'
import Image from 'next/image'

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }))
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const proj = getProjectBySlug(params.slug)
  if (!proj) return notFound()
  // Prepare media: prefer first video as hero, fallback to first image
  const typedMedia: MediaItem[] = Array.isArray(proj.media)
    ? (proj.media as any[]).map((m) => (typeof m === 'string' ? ({ type: 'image', src: m } as MediaItem) : (m as MediaItem)))
    : []
  const firstVideoIdx = typedMedia.findIndex((m) => m.type === 'video')
  const firstImageIdx = typedMedia.findIndex((m) => m.type === 'image')
  const heroIndex = firstVideoIdx !== -1 ? firstVideoIdx : 0
  const hero = typedMedia[heroIndex]
  const sideMedia = typedMedia.filter((_, idx) => idx !== heroIndex)

  // Helper: pick sections by title
  const findSection = (title: string) => proj.sections?.find((s) => s.title.toLowerCase() === title.toLowerCase())
  const about = findSection('About the Project')
  const instructions = findSection('Instructions')
  const features = findSection('Features')
  const technical = findSection('Technical Implementation')
  const challenges = findSection('Challenges & Solutions')
  const techs = findSection('Technologies Used')
  const downloadSec = findSection('Download & Play')

  // Choose a small preview media for the About right column
  const previewMedia = sideMedia.find((m) => m.type === 'image' || m.type === 'video')
  const galleryMedia = sideMedia.filter((m) => m !== previewMedia)

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-8">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted hover:bg-white/10 hover:text-fg/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <span aria-hidden>←</span>
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Cinematic hero */}
      {hero ? (
        <section aria-label="Project hero" className="mb-10">
          {params.slug === 'ai-fitness-tracker' ? (
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="/projects/ai-fitness-tracker/AIfitnesstrackertitle.png?v=2"
                alt="AI Fitness Tracker Title"
                width={600}
                height={400}
                className="h-[36vh] md:h-[42vh] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-end">
                <div className="w-full p-5 md:p-8">
                  <h1 className="text-3xl md:text-5xl font-semibold leading-tight">{proj.title}</h1>
                </div>
              </div>
            </div>
          ) : hero.type === 'image' ? (
            <div className="relative overflow-hidden rounded-2xl">
              <img src={hero.src} alt={(hero as any).alt || ''} className="h-[36vh] md:h-[42vh] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-end">
                <div className="w-full p-5 md:p-8">
                  <h1 className="text-3xl md:text-5xl font-semibold leading-tight">{proj.title}</h1>
                </div>
              </div>
            </div>
          ) : hero.type === 'video' ? (
            <VideoHero
              className="h-[36vh] md:h-[42vh]"
              poster={(hero as any).poster || (firstImageIdx !== -1 ? (typedMedia[firstImageIdx] as any).src : undefined)}
              src={(hero as any).src}
              sources={(hero as any).sources}
            >
              <div className="absolute inset-0 flex items-end">
                <div className="w-full p-5 md:p-8">
                  <h1 className="text-3xl md:text-5xl font-semibold leading-tight">{proj.title}</h1>
                </div>
              </div>
            </VideoHero>
          ) : null}
        </section>
      ) : null}

      {/* (Removed centered logo block; logo will appear in About column) */}

      {/* Live Demo CTA moved to bottom for AI Fitness Tracker */}

      {/* Tags moved under About/body per request */}

      {/* Highlights grid removed per request */}

      <div className="grid gap-10">
        {/* Main content */}
        <article>
          {/* Sub-masthead removed (chips + summary) per request to avoid redundancy */}

          {/* About (two columns) merged with body text */}
          {(about || proj.body) ? (
            <Reveal as="section" aria-label="About" className="mb-10">
              <div className="grid gap-6 md:grid-cols-2 items-start">
                <div className="prose prose-invert max-w-none">
                  {about?.paragraphs?.map((p, i) => (
                    <p key={`about-p-${i}`}>{p}</p>
                  ))}
                  {proj.body ? <p>{proj.body}</p> : null}
                  {(proj as any).tags?.length || proj.tech?.length ? (
                    <div className="not-prose mt-4 flex flex-wrap gap-2">
                      {(((proj as any).tags as string[]) ?? proj.tech).map((t) => (
                        <span
                          key={`tag-${t}`}
                          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                {params.slug === 'ai-fitness-tracker' ? (
                  <figure className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-0 w-fit mx-auto">
                    {/* soft radial glow behind the logo */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-16 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(59,130,246,0.18),transparent_70%)] blur-2xl opacity-70"
                    />
                    <Image
                      src="/projects/ai-fitness-tracker/personalhealthlogo.png?v=2"
                      alt="Personal Health mark"
                      width={300}
                      height={300}
                      className="block h-auto drop-shadow-xl rounded-3xl"
                      priority
                    />
                  </figure>
                ) : previewMedia ? (
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
                    {previewMedia.type === 'image' ? (
                      <img src={previewMedia.src} alt={(previewMedia as any).alt || ''} className="w-full h-auto object-cover" />
                    ) : previewMedia.type === 'video' ? (
                      <video className="w-full h-auto" poster={(previewMedia as any).poster} controls preload="metadata">
                        {(previewMedia as any).sources?.length
                          ? (previewMedia as any).sources.map((s: any, i: number) => <source key={`pv-${i}`} src={s.src} type={s.type} />)
                          : <source src={previewMedia.src} />}
                      </video>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Reveal>
          ) : null}

          {/* Instructions + Controls will be rendered at the bottom */}

          {/* Collapsible: Features, Technical, Challenges, Technologies */}
          {(features || technical || challenges || techs) ? (
            <Reveal as="section" className="mb-10">
              <div className="space-y-3">
                {[features, technical, challenges, techs].filter(Boolean).map((sec, idx) => (
                  <details key={`acc-${(sec as any)!.title}-${idx}`} className="group rounded-xl border border-white/10 bg-white/[0.04] open:bg-white/[0.06] p-0 overflow-hidden">
                    <summary className="cursor-pointer list-none select-none px-4 py-4 flex items-center justify-between">
                      <span className="text-lg md:text-2xl font-semibold">{(sec as any)!.title}</span>
                      <span className="text-sm md:text-base text-white/60 transition-transform duration-300 group-open:rotate-180">⌄</span>
                    </summary>
                    <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-500">
                      <div className="overflow-hidden px-4 pb-4">
                        {(sec as any)!.paragraphs?.map((p: string, i: number) => (
                          <p key={`acc-p-${i}`} className="text-base md:text-[17px] leading-relaxed text-fg/90 mb-2">{p}</p>
                        ))}
                        {(sec as any)!.bullets?.length ? (
                          <ul className="mt-3 space-y-2 text-base md:text-[17px] text-fg/90 list-disc list-inside">
                            {(sec as any)!.bullets.map((b: string, k: number) => (
                              <li key={`acc-b-${k}`}>{b}</li>
                            ))}
                          </ul>
                        ) : null}
                        {(sec as any)!.image ? (
                          <div className="mt-4 flex justify-center not-prose">
                            <img
                              src={(sec as any)!.image.src}
                              alt={(sec as any)!.image.alt || ''}
                              className={`w-full h-auto object-cover rounded-lg border border-white/10 bg-white/5 ${['Features','Technical Implementation'].includes((sec as any)!.title) ? 'max-w-3xl md:max-w-4xl' : 'max-w-sm md:max-w-md'}`}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </Reveal>
          ) : null}

          {/* Media Gallery Grid */}
          {galleryMedia.length ? (
            <Reveal as="section" className="mb-10">
              <h2 className="sr-only">Gallery</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryMedia.map((item, idx) => {
                  if (item.type === 'image') {
                    return (
                      <figure key={`g-img-${idx}`} className="overflow-hidden rounded-xl bg-white/5">
                        <img src={item.src} alt={item.alt || ''} className="h-full w-full object-cover" />
                        {item.caption && (
                          <figcaption className="px-3 py-2 text-xs text-muted">{item.caption}</figcaption>
                        )}
                      </figure>
                    )
                  }
                  if (item.type === 'video') {
                    return (
                      <figure key={`g-vid-${idx}`} className="overflow-hidden rounded-xl bg-black/50">
                        <video className="w-full h-auto" poster={item.poster} controls preload="metadata">
                          {item.sources?.length
                            ? item.sources.map((s, i) => <source key={`g-${i}`} src={s.src} type={s.type} />)
                            : <source src={item.src} />}
                        </video>
                        {item.caption && (
                          <figcaption className="px-3 py-2 text-xs text-muted">{item.caption}</figcaption>
                        )}
                      </figure>
                    )
                  }
                  if (item.type === 'embed') {
                    return (
                      <div key={`g-emb-${idx}`} className="aspect-video overflow-hidden rounded-xl bg-white/5">
                        <iframe
                          src={item.src}
                          title={item.title || 'Embedded content'}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </Reveal>
          ) : null}

          {/* Instructions + Controls card (moved before Download) */}
          {(instructions || proj.controls?.length) ? (
            <Reveal as="section" className="mt-8 mb-12 md:mb-16">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-5 md:p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {instructions ? (
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Instructions</h2>
                      {instructions.bullets?.length ? (
                        <ul className="space-y-2 text-fg/90 list-disc list-inside">
                          {instructions.bullets.map((b, i) => (
                            <li key={`inst-${i}`}>{b}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                  {proj.controls?.length ? (
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Controls</h2>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {proj.controls.map((c) => {
                          const [keys, action] = c.split('—').map((s) => s.trim())
                          const parts = keys.split('/')
                          return (
                            <div key={c} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                              <span className="text-xs text-muted">
                                {parts.map((k, i) => (
                                  <span key={`${k}-${i}`} className="mr-1 inline-flex items-center gap-1">
                                    <kbd className="rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium ring-1 ring-white/15">
                                      {k.trim()}
                                    </kbd>
                                    {i < parts.length - 1 ? <span className="text-[10px] text-white/40">/</span> : null}
                                  </span>
                                ))}
                              </span>
                              <span className="text-sm text-fg/90">{action || ''}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ) : null}

          {/* Download & Play CTA */}
          {downloadSec || proj.downloads?.length ? (
            <Reveal as="section" className="mb-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Download & Play</h2>
                    {downloadSec?.bullets?.length ? (
                      <ul className="mt-2 space-y-1 text-sm text-fg/90 list-disc list-inside">
                        {downloadSec.bullets.map((b, i) => (
                          <li key={`dl-${i}`}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  {proj.downloads?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {proj.downloads.map((d) => (
                        <a key={d.label} href={d.href} className="inline-flex items-center rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm hover:bg-white/15">
                          {d.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ) : null}

          {/* Live Demo CTA for AI Fitness Tracker */}
          {proj.slug === 'ai-fitness-tracker' ? (
            <Reveal as="section" className="mb-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Try the Live Demo</h2>
                  <p className="text-sm text-white/70">This is a mini, client-only demo for the case study. The full app (not included) uses Java Servlets + MySQL with richer features.</p>
                </div>
                <div className="flex gap-2">
                  <a href="/ai-fitness-tracker" className="inline-flex items-center rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15">Open Demo</a>
                </div>
              </div>
            </Reveal>
          ) : null}

          {/* End of article content */}
        </article>
      </div>
    </main>
  )
}
