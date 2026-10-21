import PhotographyExhibition from '@/components/photography/PhotographyExhibition'
import { photographyExhibitions } from '@/lib/content/exhibitions'
import { buildPageMetadata } from '@/lib/site/metadata'

export const metadata = buildPageMetadata({
  title: '摄影',
  description: 'A photographic exhibition of Bangkok, street life, animals, and ongoing projects.',
  path: '/photography',
  image: photographyExhibitions[0].photos[0].src,
})

export default function PhotographyPage() {
  return <PhotographyExhibition collections={photographyExhibitions} initialCollectionId="bangkok" />
}
