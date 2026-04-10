import SectionOverline from './SectionOverline'
import TightGalleryGrid from './TightGalleryGrid'
import PhotographyFeaturedPublications from './PhotographyFeaturedPublications'
import type { Photo } from '@/lib/types'
import type { PhotographyFeaturedPublication } from './series'

interface PhotographySeriesTemplateProps {
  overline: string
  title: string
  intro: string
  description: string
  photos: Photo[]
  featuredPublications?: PhotographyFeaturedPublication[]
}

export default function PhotographySeriesTemplate({
  overline,
  title,
  intro,
  description,
  photos,
  featuredPublications = [],
}: PhotographySeriesTemplateProps) {
  return (
    <main className="photo-series-page">
      <section className="photo-series-intro">
        <div className="site-shell">
          <div className="photo-series-intro-copy">
            <SectionOverline>{overline}</SectionOverline>
            <h1>{title}</h1>
            <p className="photo-series-intro-lead">{intro}</p>
            <p className="photo-series-intro-text">{description}</p>
          </div>
        </div>
      </section>

      <TightGalleryGrid photos={photos} />

      <PhotographyFeaturedPublications
        title="Selected related work"
        items={featuredPublications}
      />
    </main>
  )
}
