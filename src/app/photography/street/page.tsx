import { PhotographySeriesHero, SeriesStatement, TightGalleryGrid, getPhotographySeries } from '@/components/photography'
import { getAllPhotos } from '@/lib/data/photos'
import { PhotoCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function StreetPage() {
  const photos = await getAllPhotos()
  const series = getPhotographySeries('street')
  const seriesPhotos = photos.filter((photo) => photo.category === PhotoCategory.Street)

  if (!series) {
    return null
  }

  return (
    <main className="bg-[var(--portfolio-bg)] text-[var(--portfolio-text)]">
      <PhotographySeriesHero
        overline={series.overline}
        title={series.title}
        subtitle={series.landingDescription}
        lead={series.heroLead}
        featuredPhoto={seriesPhotos[0] ?? null}
      />
      <SeriesStatement paragraphs={series.statement} />
      <TightGalleryGrid photos={seriesPhotos} />
    </main>
  )
}
