import fs from 'fs/promises'
import path from 'path'
import PhotographyClient from './PhotographyClient'

export default async function Photography() {
  // Read local images from public/photos directly on the server
  const dir = path.join(process.cwd(), 'public', 'photos')
  let photos: string[] = []
  try {
	const files = await fs.readdir(dir)
	photos = files
	  .filter((f) => /(\.jpg|\.jpeg|\.png|\.webp|\.gif|\.avif)$/i.test(f))
	  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
	  .map((name) => `/photos/${name}`)
  } catch (_) {
	photos = []
  }

  return (
	<section id="photos" aria-labelledby="photos-title" className="relative mx-auto max-w-7xl px-6 pt-14 md:pt-16 pb-4 md:pb-6 [content-visibility:auto] [contain-intrinsic-size:800px]">
			  <header className="relative z-20 mb-2 md:mb-3 text-center">
				<h2 id="photos-title" className="text-3xl md:text-5xl font-semibold tracking-tight text-fg title-glow">Photography</h2>
				<p className="mt-2 text-muted">
					Latest on
								<a
						href="https://www.instagram.com/samit.shots"
						target="_blank"
						rel="noopener noreferrer"
									className="relative z-30 inline-flex ml-1 underline underline-offset-4 text-white hover:text-white/90 px-1"
					>
						@samit.shots
					</a>
				</p>
			</header>
	  <PhotographyClient photos={photos} />
	</section>
  )
}
