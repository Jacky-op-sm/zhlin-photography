import travels from '../../../content/travel/exhibition.json'
import type { ExhibitionCollection } from '@/components/photography/PhotographyExhibition'
import { curatedExhibitions } from '@/lib/content/photography'
import { getTravelCardsBySlug } from '@/lib/content/travel'

export const photographyExhibitions: ExhibitionCollection[] = [
  ...curatedExhibitions,
  ...travels.map(({ slug, title, photos }): ExhibitionCollection => {
    const groups = getTravelCardsBySlug(slug)
    if (!groups) throw new Error(`Missing travel series: ${slug}`)
    const cards = Object.values(groups).flat()
    return {
      id: `travels/${slug}`,
      section: 'travels',
      title,
      photos: photos.filter(photo => !photo.hidden).map(({ src, width, height, place, focus }, index) => {
        if (!place) throw new Error(`Missing travel place for ${src}`)
        const matches = cards.filter(card => card.imageSrc === src)
        if (matches.length !== 1 || !matches[0].imageAlt) {
          throw new Error(`Expected one captioned travel card for ${src}`)
        }
        const { eyebrow, title, body, imageAlt } = matches[0]
        return {
          id: String(index + 1), src, thumbnail: src, width, height,
          focus, alt: imageAlt, caption: { place, eyebrow, title, body },
        }
      }),
    }
  }),
]
