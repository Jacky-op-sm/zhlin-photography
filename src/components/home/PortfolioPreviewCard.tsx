import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import TextLinkCTA from './TextLinkCTA'

type PortfolioPreviewCardProps = {
  title: string
  href: string
  image: string
  alt: string
  lead: string
  body: string
  imageClassName?: string
  ctaLabel?: string
}

export default function PortfolioPreviewCard({
  title,
  href,
  image,
  alt,
  lead,
  body,
  imageClassName,
  ctaLabel = 'See more',
}: PortfolioPreviewCardProps) {
  return (
    <article className="group flex h-full flex-col">
      <div className="flex h-full flex-col">
        <p className="portfolio-card-title">{title}</p>

        <Link href={href} className="mt-5 block">
          <div className="portfolio-card-image-shell">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[inherit]">
              <Image
                src={image}
                alt={alt}
                fill
                sizes="(min-width: 1280px) 22rem, (min-width: 1024px) 30vw, (min-width: 768px) 42vw, 88vw"
                className={clsx(
                  'object-cover transition duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-[1.04]',
                  imageClassName
                )}
              />
            </div>
          </div>
        </Link>

        <div className="mt-7 flex flex-1 flex-col">
          <p className="font-editorial-serif max-w-[22rem] text-[1.14rem] italic leading-[1.7] tracking-[-0.02em] text-[color:var(--portfolio-text)] sm:text-[1.2rem]">
            {lead}
          </p>
          <p className="mt-4 max-w-[22rem] text-[0.96rem] leading-7 text-[color:var(--portfolio-muted)]">
            {body}
          </p>
          <div className="mt-7 pt-1">
            <TextLinkCTA href={href}>{ctaLabel}</TextLinkCTA>
          </div>
        </div>
      </div>
    </article>
  )
}
