import Image from 'next/image'
import SectionOverline from './SectionOverline'
import TextLinkCTA from './TextLinkCTA'
import type { PhotographyFeaturedPublication } from './series'

interface PhotographyFeaturedPublicationsProps {
  title: string
  items: PhotographyFeaturedPublication[]
}

export default function PhotographyFeaturedPublications({
  title,
  items,
}: PhotographyFeaturedPublicationsProps) {
  if (!items.length) {
    return null
  }

  return (
    <section className="photo-publications">
      <div className="site-shell">
        <header className="photo-publications-head">
          <SectionOverline>Featured</SectionOverline>
          <h2>{title}</h2>
        </header>

        <div className="photo-publications-grid">
          {items.map((item) => (
            <article key={item.title} className="photo-publication-card">
              <div className="photo-publication-media">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 36vw, 94vw"
                  className="object-cover"
                />
              </div>
              <div className="photo-publication-body">
                <p className="photo-publication-title">{item.title}</p>
                <p className="photo-publication-text">{item.description}</p>
                <TextLinkCTA href={item.href}>{item.ctaLabel}</TextLinkCTA>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
