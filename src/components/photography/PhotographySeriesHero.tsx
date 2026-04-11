import Image from 'next/image'
import SectionOverline from './SectionOverline'
import TextLinkCTA from './TextLinkCTA'
import type { Photo } from '@/lib/types'

interface PhotographySeriesHeroProps {
  overline: string
  title: string
  subtitle: string
  lead: string
  featuredPhoto?: Photo | null
  backHref?: string
  backLabel?: string
}

export default function PhotographySeriesHero({
  overline,
  title,
  subtitle,
  lead,
  featuredPhoto,
  backHref = '/photography',
  backLabel = 'Back to Photography',
}: PhotographySeriesHeroProps) {
  return (
    <section className="photography-section">
      <div className="photography-shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
          <div className="max-w-[var(--photography-body-width)]">
            <SectionOverline>{overline}</SectionOverline>
            <h1 className="photography-title mt-4 font-editorial-serif">
              {title}
            </h1>
            <p className="mt-5 text-[clamp(1rem,1.8vw,1.18rem)] leading-8 text-[var(--portfolio-muted)]">
              {subtitle}
            </p>
            <p className="mt-6 max-w-[var(--photography-body-width)] font-editorial-serif text-[clamp(1.12rem,1.7vw,1.4rem)] italic leading-8 text-[var(--portfolio-text)]">
              {lead}
            </p>
            <div className="mt-7">
              <TextLinkCTA href={backHref}>{backLabel}</TextLinkCTA>
            </div>
          </div>

          {featuredPhoto && (
            <figure className="ml-auto w-full max-w-[34rem]">
              <div
                className="photography-media-shell relative overflow-hidden"
                style={{ aspectRatio: `${featuredPhoto.width} / ${featuredPhoto.height}` }}
              >
                <div className="photo-series-hero-media">
                  <Image
                    src={featuredPhoto.filename}
                    alt={featuredPhoto.title}
                    fill
                    className="object-cover photo-gallery-hover brightness-hover"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    priority
                  />
                </div>
              </div>
              <figcaption className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--portfolio-soft)]">
                {featuredPhoto.title}
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  )
}

