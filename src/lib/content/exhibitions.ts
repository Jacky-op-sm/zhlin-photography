import bangkok from '../../../content/photography/exhibitions/bangkok.json'
import travels from '../../../content/travel/exhibition.json'
import type { ExhibitionCollection } from '@/components/photography/PhotographyExhibition'
import { photographyPhotos, photographySeriesContent } from '@/lib/content/photography'
import { exhibitionCollectionSchema } from '@/lib/content/schemas'
import { getTravelCardsBySlug } from '@/lib/content/travel'

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
  ...travels.map(({ slug, title, photos }): ExhibitionCollection => {
    const groups = getTravelCardsBySlug(slug)
    if (!groups) throw new Error(`Missing travel series: ${slug}`)
    const cards = Object.values(groups).flat()
    return {
      id: `travels/${slug}`,
      section: 'travels',
      title,
      photos: photos.map(({ src, width, height }, index) => {
        const matches = cards.filter(card => card.imageSrc === src)
        if (matches.length !== 1 || !matches[0].imageAlt) {
          throw new Error(`Expected one captioned travel card for ${src}`)
        }
        const { eyebrow, title, body, imageAlt } = matches[0]
        return {
          id: String(index + 1), src, thumbnail: src, width, height,
          alt: imageAlt, caption: { eyebrow, title, body },
        }
      }),
    }
  }),
]
