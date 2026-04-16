import PhotographySeriesTemplate from '@/components/photography/PhotographySeriesTemplate'
import { getPhotographySeries } from '@/components/photography/series'
import { getAllPhotos } from '@/lib/data/photos'
import { PhotoCategory } from '@/lib/types'

export default async function PetsPage() {
  const photos = await getAllPhotos()
  const series = getPhotographySeries('pets')
  const seriesPhotos = photos.filter((photo) => photo.category === PhotoCategory.Pets)

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
