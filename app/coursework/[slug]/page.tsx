import { featuredAcademics, getAcademicBySlug } from '@/content/academics'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export function generateStaticParams() {
  return featuredAcademics.map((a) => ({ slug: a.slug }))
}

export default function CourseworkPage({ params }: { params: { slug: string } }) {
  const item = getAcademicBySlug(params.slug)
  if (!item) return notFound()
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 md:py-20">
      <div className="mb-8">
        <Link
          href="/#coursework"
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted hover:bg-white/10 hover:text-fg/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <span aria-hidden>←</span>
          <span>Back to Coursework</span>
        </Link>
      </div>

      <article className="prose prose-invert max-w-none">
        <header className="mb-6 md:mb-8 not-prose">
          <p className="text-xs uppercase tracking-wide text-white/60">{item.kind}</p>
          <h1 className="mt-1 text-3xl md:text-5xl leading-tight">{item.title}</h1>
          {(item.course || item.term) && (
            <p className="mt-3 text-muted">{[item.course, item.term].filter(Boolean).join(' • ')}</p>
          )}
        </header>

        {item.description && <p className="text-base md:text-lg">{item.description}</p>}

        {item.link && (
          <p className="mt-6 not-prose">
            <a
              href={item.link}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted hover:bg-white/10 hover:text-fg/90"
              target="_blank" rel="noopener noreferrer"
            >
              View Artifact
            </a>
          </p>
        )}
      </article>
    </main>
  )
}
