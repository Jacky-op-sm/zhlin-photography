import PhotographyExhibition from '@/components/photography/PhotographyExhibition'
import { getPhotographySeries } from '@/components/photography/series'
import { photographyExhibitions } from '@/lib/content/exhibitions'
import { buildPageMetadata } from '@/lib/site/metadata'

const series = getPhotographySeries('street')

export const metadata = buildPageMetadata({
  title: series?.title ?? '街拍摄影',
  description: series?.landingSummary ?? '城市街头摄影作品。',
  path: '/photography/street',
  image: series?.cover,
})

export default function StreetPage() {
  return (
    <PhotographyExhibition collections={photographyExhibitions} initialCollectionId="street" />
  )
}
