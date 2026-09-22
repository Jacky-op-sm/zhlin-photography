import PhotographySeriesTemplate from '@/components/photography/PhotographySeriesTemplate'
import { getPhotographySeries, getSeriesPhotos } from '@/components/photography/series'
import { photographyPhotos } from '@/lib/content/photography'
import { buildPageMetadata } from '@/lib/site/metadata'

const series = getPhotographySeries('pets')

export const metadata = buildPageMetadata({
  title: series?.title ?? '动物摄影',
  description: series?.landingSummary ?? '动物与宠物摄影作品。',
  path: '/photography/pets',
  image: series?.cover,
})

export default function PetsPage() {
  if (!series) {
    return null
  }

  return (
    <PhotographySeriesTemplate
      overline={series.overline}
      title={series.title}
      intro={series.landingSummary}
      description={series.landingDescription}
      photos={getSeriesPhotos(photographyPhotos, 'pets')}
    />
  )
}
