import Hero from '@/components/Hero'
import About from '@/components/sections/About'
import Experience from '@/components/sections/Experience'
import Projects from '@/components/sections/Projects'
import Coursework from '@/components/sections/Coursework'
import FooterCTA from '@/components/sections/FooterCTA'
import PhotoShowcase from '@/components/sections/PhotoShowcase'

export default function HomePage() {
  return (
    <main id="main" role="main" className="relative">
      <Hero />
      <About />
      <Experience />
  <Projects />
  <Coursework />
  <PhotoShowcase />
      <FooterCTA />
    </main>
  )
}
