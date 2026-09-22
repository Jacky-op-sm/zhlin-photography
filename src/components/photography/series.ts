import { photographySeriesContent } from '@/lib/content/photography';
import type { PhotographySeriesContent } from '@/lib/content/schemas';
import type { Photo } from '@/lib/types';

export type PhotographySeriesSlug = PhotographySeriesContent['slug'];

export const photographySeries = photographySeriesContent;

export function getPhotographySeries(slug: PhotographySeriesSlug) {
  return photographySeries.find((series) => series.slug === slug);
}

export function getSeriesPhotos(photos: Photo[], slug: PhotographySeriesSlug) {
  return photos.filter((photo) => photo.category === slug);
}

export function getSeriesCoverPhoto(photos: Photo[], slug: PhotographySeriesSlug) {
  return getSeriesPhotos(photos, slug)[0] ?? null;
}
