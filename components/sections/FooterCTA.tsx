export default function FooterCTA() {
  return (
  <footer role="contentinfo" data-scroll-slight className="mx-auto max-w-6xl px-6 pt-10 pb-10">
      <div className="glass rounded-2xl p-6 md:p-7 text-center">
        <h2 className="text-3xl md:text-4xl mb-3">Contact Me</h2>
        <a
          href="mailto:vsamit.palli@gmail.com"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-3 font-medium text-fg hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 transition-colors"
        >
          Send Email
          <span aria-hidden>→</span>
        </a>
      </div>
      <p className="mt-4 text-center text-xs text-muted">© {new Date().getFullYear()} Samit Madatanapalli</p>
    </footer>
  )
}
