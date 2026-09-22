import PhotographySeriesTemplate from '@/components/photography/PhotographySeriesTemplate'
import { getPhotographySeries, getSeriesPhotos } from '@/components/photography/series'
import { photographyPhotos } from '@/lib/content/photography'
import { buildPageMetadata } from '@/lib/site/metadata'

const series = getPhotographySeries('street')

export const metadata = buildPageMetadata({
  title: series?.title ?? '街拍摄影',
  description: series?.landingSummary ?? '城市街头摄影作品。',
  path: '/photography/street',
  image: series?.cover,
})

export default function StreetPage() {
  if (!series) {
    return null
  }

  return (
    <PhotographySeriesTemplate
      overline={series.overline}
      title={series.title}
      intro={series.landingSummary}
      description={series.landingDescription}
      photos={getSeriesPhotos(photographyPhotos, 'street')}
    />
  )
}
