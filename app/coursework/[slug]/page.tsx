import { featuredAcademics, getAcademicBySlug } from '@/content/academics'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export function generateStaticParams() {
  return featuredAcademics.map((a) => ({ slug: a.slug }))
}

export default function CourseworkPage({ params }: { params: { slug: string } }) {
  const item = getAcademicBySlug(params.slug)
  if (!item) return notFound()
  return (
    <main className="mx-auto max-w-7xl 2xl:max-w-[88rem] px-4 md:px-6 lg:px-8 py-14 md:py-20">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted hover:bg-white/10 hover:text-fg/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <span aria-hidden>←</span>
          <span>Back to Home</span>
        </Link>
      </div>

      <article className="prose prose-invert max-w-none lg:grid lg:grid-cols-12 lg:gap-10">
        <header className="mb-6 md:mb-8 not-prose lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2 text-center">
          <p className="text-xs uppercase tracking-wide text-white/60">{item.kind}</p>
          <h1 className="mt-1 text-3xl md:text-5xl leading-tight">{item.title}</h1>
          {(item.course || item.term) && (
            <p className="mt-3 text-muted">{[item.course, item.term].filter(Boolean).join(' • ')}</p>
          )}
        </header>

        {/* Hero image right after the title */}
        {item.hero && (
          <figure
            className={`mt-8 mb-6 lg:col-span-12 lg:col-start-1 xl:col-span-12 xl:col-start-1 mx-auto px-0 ${item.slug === 'pipelined-mips-cpu-5-stage' ? 'full-bleed-hero' : 'max-w-2xl'}`}
          >
            <Image
              src={item.hero.src}
              alt={item.hero.alt || `${item.title} illustration`}
              width={item.hero.width || 1600}
              height={item.hero.height || 1066}
              // Reduced the max height from 820px to 700px to make the 5-stage pipeline hero slightly smaller
              className={`w-full h-auto object-contain ${item.slug === 'pipelined-mips-cpu-5-stage' ? 'max-h-[700px]' : 'rounded-xl border border-white/10 bg-white/5 shadow-lg shadow-black/30'}`}
              sizes={item.slug === 'pipelined-mips-cpu-5-stage' ? '100vw' : '(max-width: 1024px) 100vw, 55vw'}
              priority
            />
          </figure>
        )}

        {/* Show description on detail pages except for audio amplifier project (only show on home card) */}
        {item.description && item.slug !== 'audio-amplifier-circuit' && (
          <p className="text-base md:text-lg lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2">{item.description}</p>
        )}

        {item.link && (
          <p className="mt-6 not-prose lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2">
            <a
              href={item.link}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted hover:bg-white/10 hover:text-fg/90"
              target="_blank" rel="noopener noreferrer"
            >
              View Artifact
            </a>
          </p>
        )}

        {/* Long-form content if provided */}
        {item.contentHtml && (
          <div className="prose prose-invert max-w-none mt-3 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2" dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
        )}

        {/* Optional image gallery */}
        {item.images && item.images.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-4 lg:col-span-12">
            {item.images.map((img, idx) => (
              <figure key={`${item.slug}-img-${idx}`} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Image
                  src={img.src}
                  alt={img.alt || item.title}
                  width={img.width || 1654}
                  height={img.height || 2339}
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority={idx === 0}
                />
                {img.alt && <figcaption className="px-3 py-2 text-xs text-white/60">{img.alt}</figcaption>}
              </figure>
            ))}
          </div>
        )}

        {/* PDF Download CTA for the CMPEN 431 thesis page */}
        {item.slug === 'cmpen-431-design-space-exploration' && (
          <div className="not-prose lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2 mt-12 flex items-center justify-center">
            <a
              href="/academics/cmpen-431-design-space-exploration/DSE.pdf"
              download
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M12 3a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L11 12.586V4a1 1 0 0 1 1-1z" />
                <path d="M5 20a1 1 0 0 1 0-2h14a1 1 0 1 1 0 2H5z" />
              </svg>
              <span>Download Thesis (PDF)</span>
            </a>
          </div>
        )}
      </article>
    </main>
  )
}
