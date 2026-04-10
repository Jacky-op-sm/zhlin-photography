import { PhotoCategory, type Photo } from '@/lib/types'

export type PhotographySeriesSlug = Exclude<PhotoCategory, 'all'>

export interface PhotographySeriesCopy {
  slug: PhotographySeriesSlug
  title: string
  overline: string
  landingSummary: string
  landingDescription: string
  heroLead: string
  statement: string[]
  cover: string
  href: string
  ctaLabel: string
}

export const photographySeries: PhotographySeriesCopy[] = [
  {
    slug: PhotoCategory.Street,
    title: 'Street',
    overline: 'Street / Observed fragments',
    landingSummary:
      'A quiet walk through the city, shaped by light, thresholds, and passing figures.',
    landingDescription:
      'This series looks for small human gestures and the spaces between movement and stillness.',
    heroLead:
      'Street is a practice of staying long enough for ordinary scenes to become legible.',
    statement: [
      'I am drawn to moments that do not announce themselves. Reflections in glass, hard shadows across steps, a pause at the edge of a crossing - these fragments carry the rhythm of the city more honestly than spectacle does.',
      'The work is built on patience and proximity. I want the frame to feel attentive rather than intrusive, so the images can hold the tension between structure and accident, between what is seen and what is briefly felt.',
    ],
    cover: '/assets/photos/street/street-scene-1.jpg',
    href: '/photography/street',
    ctaLabel: 'View series',
  },
  {
    slug: PhotoCategory.Pets,
    title: 'Pets',
    overline: 'Pets / Quiet portraits',
    landingSummary:
      'Portraits made with natural light, patience, and a close attention to expression.',
    landingDescription:
      'The series treats animals as companions in the frame, not as subjects to be arranged.',
    heroLead:
      'Pets is a slower kind of portraiture, shaped by trust, proximity, and natural light.',
    statement: [
      'I work with animals the way I would work with people in a quiet room: gently, without insisting on performance. The best frames arrive when curiosity softens into comfort.',
      'These portraits lean into stillness, but they are never static. A glance, a tilt of the ear, the shift of a body in light - that is where character appears, and where the photograph becomes a record of presence rather than a pose.',
    ],
    cover: '/assets/photos/pets/Z52_6041.jpg',
    href: '/photography/pets',
    ctaLabel: 'View series',
  },
  {
    slug: PhotoCategory.Project,
    title: 'Project',
    overline: 'Project / Long form study',
    landingSummary:
      'A sustained observation of one intersection, where repetition turns into structure and memory.',
    landingDescription:
      'Daily light, weather, and traffic become the material of a longer visual sentence.',
    heroLead:
      'The project is built from repeated views of the same place until time begins to show itself.',
    statement: [
      'This series began with the street below my balcony and kept expanding through return. The same intersection appeared under different weather, different hours, and different states of attention, until the place became less a location than a method.',
      'What interests me here is the way repetition changes meaning. A fixed frame can hold drift, and the accumulation of ordinary moments can make a place feel intimate without turning it nostalgic.',
    ],
    cover: '/assets/photos/project/1.jpg',
    href: '/photography/project',
    ctaLabel: 'View series',
  },
]

export function getPhotographySeries(slug: PhotographySeriesSlug) {
  return photographySeries.find((series) => series.slug === slug)
}

export function getSeriesPhotos(photos: Photo[], slug: PhotographySeriesSlug) {
  return photos.filter((photo) => photo.category === slug)
}

export function getSeriesCoverPhoto(photos: Photo[], slug: PhotographySeriesSlug) {
  return getSeriesPhotos(photos, slug)[0] ?? null
}

