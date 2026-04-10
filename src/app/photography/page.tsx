import {
  PhotographyLandingHero,
  PhotographySeriesCard,
  getSeriesCoverPhoto,
  photographySeries,
} from '@/components/photography'
import { getAllPhotos } from '@/lib/data/photos'
import { redirect } from 'next/navigation'
import { PhotoCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

function normalizeCategory(value?: string | string[]) {
  const category = Array.isArray(value) ? value[0] : value

  if (
    category === PhotoCategory.Street ||
    category === PhotoCategory.Pets ||
    category === PhotoCategory.Project
  ) {
    return category
  }

  return null
}

interface PhotographyPageProps {
  searchParams?: {
    category?: string | string[]
  }
}

export default async function PhotographyPage({
  searchParams,
}: PhotographyPageProps) {
  const category = normalizeCategory(searchParams?.category)

  if (category === PhotoCategory.Street) {
    redirect('/photography/street')
  }

  if (category === PhotoCategory.Pets) {
    redirect('/photography/pets')
  }

  if (category === PhotoCategory.Project) {
    redirect('/photography/project')
  }

  const photos = await getAllPhotos()

  return (
    <main className="min-h-screen bg-[var(--portfolio-bg)] text-[var(--portfolio-text)]">
      <PhotographyLandingHero
        overline="Photography / Selected series"
        title="Photography"
        intro="A portfolio of quiet observations, held together by light, rhythm, and sustained attention."
        description="This section is organized as a small authored system: each series keeps its own pace, statement, and visual entry point. Street, pets, and the long-form project remain independent while sharing one editorial language."
      />

      <section id="series" className="photography-section">
        <div className="photography-shell">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {photographySeries.map((series, index) => {
              const previewPhoto =
                getSeriesCoverPhoto(photos, series.slug) ?? undefined

              return (
                <PhotographySeriesCard
                  key={series.slug}
                  series={series}
                  imageSrc={previewPhoto?.thumbnail ?? series.cover}
                  index={index}
                />
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
