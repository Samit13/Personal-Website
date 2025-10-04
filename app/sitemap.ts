import { MetadataRoute } from 'next'
import { PROJECTS } from '@/content/projects'
import { EXPERIENCE } from '@/content/experience'
import { featuredAcademics } from '@/content/academics'

/**
 * Dynamic sitemap to help search engines discover deep content so queries for
 * "Samit Madatanapalli" associate with rich entities (projects, experience, academics).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://samitm.com'
  const now = new Date().toISOString()

  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/projects',
    '/experience',
    '/coursework',
    '/ai-fitness-tracker'
  ].map(p => ({ url: `${base}${p}`, lastModified: now, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.6 }))

  const projectPages: MetadataRoute.Sitemap = PROJECTS.map(p => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7
  }))

  const experiencePages: MetadataRoute.Sitemap = EXPERIENCE.map(j => ({
    url: `${base}/experience/${j.slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.4
  }))

  const academicPages: MetadataRoute.Sitemap = featuredAcademics.map(a => ({
    url: `${base}/coursework/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5
  }))

  return [
    ...staticPages,
    ...projectPages,
    ...experiencePages,
    ...academicPages
  ]
}
