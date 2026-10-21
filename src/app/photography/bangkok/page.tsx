import PhotographyExhibition from '@/components/photography/PhotographyExhibition'
import { photographyExhibitions } from '@/lib/content/exhibitions'
import { buildPageMetadata } from '@/lib/site/metadata'

export const metadata = buildPageMetadata({
  title: 'Bangkok · Photography',
  description: 'Photographs from Bangkok, presented one frame at a time.',
  path: '/photography/bangkok',
  image: photographyExhibitions[0].photos[0].src,
})

export default function BangkokPhotographyPage() {
  return <PhotographyExhibition collections={photographyExhibitions} initialCollectionId="bangkok" />
}
