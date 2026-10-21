import bangkok from '../../../content/photography/exhibitions/bangkok.json'
import type { ExhibitionCollection } from '@/components/photography/PhotographyExhibition'
import { photographyPhotos, photographySeriesContent } from '@/lib/content/photography'
import { exhibitionCollectionSchema } from '@/lib/content/schemas'

const collectionTitles = { street: 'Street', pets: 'Animals', project: 'Projects' }

export const photographyExhibitions: ExhibitionCollection[] = [
  exhibitionCollectionSchema.parse(bangkok),
  ...photographySeriesContent.map((series) => ({
    id: series.slug,
    title: collectionTitles[series.slug],
    description: series.landingSummary,
    photos: photographyPhotos
      .filter((photo) => photo.category === series.slug)
      .map((photo) => ({
        id: photo.id,
        src: photo.filename,
        thumbnail: photo.thumbnail,
        width: photo.width,
        height: photo.height,
        alt: photo.title,
      })),
  })),
]
