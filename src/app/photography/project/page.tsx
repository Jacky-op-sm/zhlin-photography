import {
  PhotographySeriesHero,
  SeriesStatement,
  TightGalleryGrid,
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
    <main className="bg-[var(--portfolio-bg)] text-[var(--portfolio-text)]">
      <PhotographySeriesHero
        overline={series.overline}
        title={projectMeta.title}
        subtitle={projectMeta.titleEn}
        lead={series.heroLead}
        featuredPhoto={seriesPhotos[0] ?? null}
      />
      <SeriesStatement
        title="Long-form observation from a fixed frame"
        paragraphs={[projectMeta.description, ...series.statement]}
      />
      <TightGalleryGrid photos={seriesPhotos} />
    </main>
  )
}
