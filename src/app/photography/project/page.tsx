import {
  PhotographySeriesTemplate,
  getPhotographySeries,
} from '@/components/photography'
import { getAllPhotos, getProjectMeta } from '@/lib/data/photos'
import { PhotoCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ProjectPage() {
  const photos = await getAllPhotos()
  const series = getPhotographySeries('project')
  const seriesPhotos = photos.filter((photo) => photo.category === PhotoCategory.Project)
  const projectMeta = getProjectMeta()

  if (!series) {
    return null
  }

  return (
    <PhotographySeriesTemplate
      overline={series.overline}
      title={projectMeta.title}
      intro={projectMeta.titleEn}
      description={projectMeta.description}
      photos={seriesPhotos}
      featuredPublications={series.featuredPublications}
    />
  )
}
