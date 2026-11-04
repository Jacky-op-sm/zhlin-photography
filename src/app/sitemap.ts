import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site/metadata'
import { publicPaths } from '@/lib/site/routes'
import { getWritingMetadata } from '@/lib/content/writing'
import { getAllTravel } from '@/lib/content/travel'

export default function sitemap(): MetadataRoute.Sitemap {
  // /writing only redirects to the newest piece, so it is not a canonical page.
  const paths = new Set([
    ...publicPaths.filter(path => path !== '/writing'),
    ...getAllTravel().map(entry => `/travel/${entry.slug}`),
    ...getWritingMetadata().map(entry => `/writing/${entry.slug}`),
  ])

  return [...paths].map((path) => ({
    url: new URL(path, SITE_URL).href,
    changeFrequency: path === '/' ? 'monthly' : 'yearly',
    priority: path === '/' ? 1 : path.split('/').length === 2 ? 0.8 : 0.7,
  }))
}
