import Image from 'next/image'
import Link from 'next/link'
import SectionOverline from '@/components/photography/SectionOverline'
import {
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
    <main className="photo-index-page">
      <section className="photo-index-intro">
        <div className="site-shell">
          <div className="photo-index-intro-copy">
            <SectionOverline>Photography</SectionOverline>
            <h1>Photography</h1>
            <p>
              Three authored series built from the same practice: close observation,
              repeat visits, and attention to light.
            </p>
          </div>
        </div>
      </section>

      <section className="photo-index-series">
        <div className="site-shell photo-index-series-grid">
          {photographySeries.map((series) => {
            const previewPhoto = getSeriesCoverPhoto(photos, series.slug)

            return (
              <article key={series.slug} className="photo-index-card">
                <Link href={series.href} className="photo-index-card-media-link">
                  <div className="photo-index-card-media">
                    <Image
                      src={previewPhoto?.thumbnail ?? series.cover}
                      alt={series.title}
                      fill
                      sizes="(min-width: 1280px) 28vw, (min-width: 768px) 44vw, 95vw"
                      className="object-cover"
                    />
                  </div>
                </Link>

                <div className="photo-index-card-body">
                  <SectionOverline>{series.overline}</SectionOverline>
                  <h2>{series.title}</h2>
                  <Link href={series.href} className="photo-inline-link">
                    View series
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
