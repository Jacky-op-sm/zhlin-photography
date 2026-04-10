import Image from 'next/image'
import Link from 'next/link'
import SectionOverline from './SectionOverline'
import TextLinkCTA from './TextLinkCTA'
import type { PhotographySeriesCopy } from './series'

interface PhotographySeriesCardProps {
  series: PhotographySeriesCopy
  imageSrc: string
  index?: number
}

export default function PhotographySeriesCard({
  series,
  imageSrc,
  index = 0,
}: PhotographySeriesCardProps) {
  return (
    <article className="group flex h-full flex-col">
      <Link href={series.href} className="block">
        <div className="photography-media-shell aspect-[4/3]">
          <Image
            src={imageSrc}
            alt={series.title}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.025] group-hover:brightness-[0.98]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            priority={index === 0}
          />
        </div>
      </Link>

      <div className="pt-4">
        <SectionOverline>{series.overline}</SectionOverline>
        <h2 className="mt-3 text-[clamp(1.6rem,2.5vw,2.5rem)] font-semibold tracking-tight">
          {series.title}
        </h2>
        <p className="photography-body mt-4 text-[1rem]">{series.landingSummary}</p>
        <p className="mt-4 max-w-[var(--photography-body-width)] text-sm leading-7 text-[var(--portfolio-soft)]">
          {series.landingDescription}
        </p>
        <div className="mt-5">
          <TextLinkCTA href={series.href}>{series.ctaLabel}</TextLinkCTA>
        </div>
      </div>
    </article>
  )
}

