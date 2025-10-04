import { MetadataRoute } from 'next'

/**
 * robots.txt – allow all, point to sitemap
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      }
    ],
    sitemap: 'https://samitm.com/sitemap.xml'
  }
}
