import PhotographyExhibition from '@/components/photography/PhotographyExhibition'
import { getPhotographySeries } from '@/components/photography/series'
import { photographyExhibitions } from '@/lib/content/exhibitions'
import { buildPageMetadata } from '@/lib/site/metadata'

const series = getPhotographySeries('pets')

export const metadata = buildPageMetadata({
  title: series?.title ?? '动物摄影',
  description: series?.landingSummary ?? '动物与宠物摄影作品。',
  path: '/photography/pets',
  image: series?.cover,
})

export default function PetsPage() {
  return (
    <PhotographyExhibition collections={photographyExhibitions} initialCollectionId="pets" />
  )
}
