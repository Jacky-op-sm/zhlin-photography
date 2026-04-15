import {
  PhotographySeriesTemplate,
  getPhotographySeries,
} from '@/components/photography'
import { getAllPhotos } from '@/lib/data/photos'
import { PhotoCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ProjectPage() {
  const photos = await getAllPhotos()
  const series = getPhotographySeries('project')
  const seriesPhotos = photos.filter((photo) => photo.category === PhotoCategory.Project)

  if (!series) {
    return null
  }

  return (
    <PhotographySeriesTemplate
      overline={series.overline}
      title={series.title}
      intro={series.landingSummary}
      description={series.landingDescription}
      photos={seriesPhotos}
    />
  )
}
