import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site/metadata'
import { publicPaths } from '@/lib/site/routes'

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: new URL(path, SITE_URL).href,
    changeFrequency: path === '/' ? 'monthly' : 'yearly',
    priority: path === '/' ? 1 : path.split('/').length === 2 ? 0.8 : 0.7,
  }))
}
