import SectionOverline from './SectionOverline'
import TextLinkCTA from './TextLinkCTA'

interface PhotographyLandingHeroProps {
  overline: string
  title: string
  intro: string
  description: string
  ctaHref?: string
  ctaLabel?: string
}

export default function PhotographyLandingHero({
  overline,
  title,
  intro,
  description,
  ctaHref = '#series',
  ctaLabel = 'View selected series',
}: PhotographyLandingHeroProps) {
  return (
    <section className="photography-section">
      <div className="photography-shell">
        <div className="max-w-[var(--photography-body-width)]">
          <SectionOverline>{overline}</SectionOverline>
          <h1 className="photography-title mt-4 font-editorial-serif">
            {title}
          </h1>
          <p className="mt-5 text-[clamp(1.05rem,2vw,1.3rem)] leading-8 text-[var(--portfolio-muted)]">
            {intro}
          </p>
          <p className="photography-body mt-6">{description}</p>
          <div className="mt-8">
            <TextLinkCTA href={ctaHref}>{ctaLabel}</TextLinkCTA>
          </div>
        </div>
      </div>
    </section>
  )
}

