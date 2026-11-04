import { photographySeriesContent } from '@/lib/content/photography';
import type { PhotographySeriesContent } from '@/lib/content/schemas';

export function getPhotographySeries(slug: PhotographySeriesContent['slug']) {
  return photographySeriesContent.find((series) => series.slug === slug);
}
