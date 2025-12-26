export default function FooterCTA() {
  return (
  <footer role="contentinfo" className="mx-auto max-w-6xl px-6 pt-10 pb-10">
      <div className="glass rounded-2xl p-6 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-semibold">Open to impactful projects and research opportunities.</h2>
          </div>

          <div className="flex items-center justify-center gap-3">
            <a
              href="mailto:vsamit.palli@gmail.com"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2.5 font-medium text-fg hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 transition-colors"
              aria-label="Send email to Samit"
            >
              Send Email
              <span aria-hidden>→</span>
            </a>

            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-4 py-2 font-medium text-white/90 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/10 transition-colors"
              aria-label="Download resume"
            >
              Resume
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-center md:text-left">
          <div className="text-xs text-muted">Designed &amp; built by Samit Madatanapalli</div>
          <div className="text-xs text-muted">Hosted on <a href="https://vercel.com" className="underline">vercel.com</a></div>
        </div>
      </div>
    </footer>
  )
}
