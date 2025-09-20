import { getJobBySlug } from '@/content/experience'
import { notFound } from 'next/navigation'
import BackdropClose from '@/components/BackdropClose'
import CloseButton from '@/components/CloseButton'
import ViewTransition from '@/components/ViewTransition'
import Image from 'next/image'

export default function ExperiencePage({ params }: { params: { slug: string } }) {
  const job = getJobBySlug(params.slug)
  if (!job) return notFound()

  return (
    <main className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop that closes on click outside the card (preserves scroll via history.back) */}
      <BackdropClose className="fixed inset-0 bg-black/70 backdrop-blur-md" />
      <ViewTransition
        name={`exp-${job.slug}`}
        as="article"
        className="modal-card relative z-[61] glass highlight w-[min(95vw,1200px)] max-h-[85vh] overflow-y-auto rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/60 transition-colors"
      >
        <CloseButton className="absolute right-4 top-4 rounded-md px-3 py-1.5 text-sm text-muted hover:text-fg/90 focus:outline-none focus:ring-2 focus:ring-white/30" />
        <header className="mb-6 md:mb-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl md:text-5xl leading-tight flex items-center gap-3">
              {job.logo ? (
                <Image
                  src={job.logo}
                  alt={`${job.company} logo`}
                  width={56}
                  height={56}
                  className="h-12 w-12 md:h-14 md:w-14 object-contain rounded-sm bg-white/5 p-0.5 border border-white/10"
                />
              ) : null}
              <span>{job.company}</span>
            </h1>
            <span className="text-sm md:text-base text-muted">{job.time}</span>
          </div>
          <p className="mt-2 text-muted">{job.role}</p>
        </header>
        {Array.isArray(job.bullets) && job.bullets.length > 0 ? (
          <ul className="mt-4 list-disc space-y-3 pl-6 text-fg/90">
            {job.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
        ) : (
          <p className="text-muted">No details available.</p>
        )}
  </ViewTransition>
    </main>
  )
}
