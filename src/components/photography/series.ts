import { photographySeriesContent } from '@/lib/content/photography';
import { PhotoCategory, type Photo } from '@/lib/types';

export type PhotographySeriesSlug = Exclude<PhotoCategory, 'all'>;

export interface PhotographyFeaturedPublication {
  title: string;
  description: string;
  image: string;
  href: string;
  ctaLabel: string;
}

export interface PhotographySeriesCopy {
  slug: PhotographySeriesSlug;
  title: string;
  overline: string;
  landingSummary: string;
  landingDescription: string;
  heroLead: string;
  statement: string[];
  cover: string;
  href: string;
  ctaLabel: string;
  featuredPublications?: PhotographyFeaturedPublication[];
}

export const photographySeries = photographySeriesContent as PhotographySeriesCopy[];

export function getPhotographySeries(slug: PhotographySeriesSlug) {
  return photographySeries.find((series) => series.slug === slug);
}

export function getSeriesPhotos(photos: Photo[], slug: PhotographySeriesSlug) {
  return photos.filter((photo) => photo.category === slug);
}

export function getSeriesCoverPhoto(photos: Photo[], slug: PhotographySeriesSlug) {
  return getSeriesPhotos(photos, slug)[0] ?? null;
}
