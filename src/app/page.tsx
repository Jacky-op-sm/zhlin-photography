import Image from 'next/image'
import Link from 'next/link'
import { getHomepageContent, getProfileContent } from '@/lib/site/content'
import type {
  HobbyistShowcaseCard,
  PhotographerShowcaseCard,
  TravellerShowcaseCard,
} from '@/lib/site/types'

export default function Home() {
  const profile = getProfileContent()
  const homepage = getHomepageContent()

  return (
    <main className="home-page" data-footer-tone="gray">
      <section className="home-band home-band--light home-hero-band">
        <div className="site-shell home-hero-grid">
          <div className="home-hero-copy">
            <h1>
              {homepage.hero.titleLines[0]}
              <br />
              {homepage.hero.titleLines[1]}
              <br />
              {homepage.hero.titleLines[2]}
            </h1>
            <p className="home-hero-summary">{homepage.hero.summary}</p>
            <div className="home-hero-links">
              {homepage.hero.links.map((link) => (
                <Link key={link.href} href={link.href} className="home-inline-link">
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <figure className="home-hero-panel">
            <div className="home-hero-image-wrap">
              <Image
                src={profile.avatar}
                alt={`${profile.name} 的照片`}
                fill
                priority
                sizes="(min-width: 1280px) 22rem, (min-width: 768px) 20rem, 82vw"
                className="object-cover"
              />
            </div>
            <figcaption>
              <p className="home-overline">个人简介</p>
              <p className="home-hero-name">{profile.displayName}</p>
              <p className="home-hero-meta">
                {profile.displayTitle}
                <br />
                {profile.displayCity}
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      <PhotographerShowcase cards={homepage.photography} />

      <TravellerShowcase cards={homepage.travel} />

      <HobbyistShowcase cards={homepage.hobby} />
    </main>
  )
}

function HobbyistShowcase({ cards }: { cards: HobbyistShowcaseCard[] }) {
  return (
    <section className="home-hobbyist-section">
      <div className="home-photographer-marquee-wrap" aria-hidden="true">
        <p className="home-photographer-marquee">
          <span>HOBBYIST&nbsp;&nbsp;</span>
          <span>HOBBYIST&nbsp;&nbsp;</span>
          <span>HOBBYIST&nbsp;&nbsp;</span>
        </p>
      </div>

      <div className="site-shell home-photographer-grid home-hobbyist-grid">
        {cards.map((card) => (
          <article key={card.title} className="home-photographer-card home-hobbyist-card">
            <div className="home-hobbyist-copy">
              <h2 className="home-hobbyist-title">
                <Link href={card.href}>{card.title}</Link>
              </h2>
              <p className="home-hobbyist-body">{card.body}</p>
            </div>

            <Link href={card.href} className="home-photographer-image-link">
              <div className="home-photographer-image">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 1800px) 27vw, (min-width: 900px) 30vw, 90vw"
                  className={`object-cover ${card.imageClassName || ''}`}
                />
              </div>
            </Link>

            <Link href={card.href} className="home-photographer-see-more">
              <span>进一步了解</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

function TravellerShowcase({ cards }: { cards: TravellerShowcaseCard[] }) {
  return (
    <section className="home-traveller-section">
      <div className="home-photographer-marquee-wrap" aria-hidden="true">
        <p className="home-photographer-marquee">
          <span>TRAVELLER&nbsp;&nbsp;</span>
          <span>TRAVELLER&nbsp;&nbsp;</span>
          <span>TRAVELLER&nbsp;&nbsp;</span>
        </p>
      </div>

      <div className="site-shell home-photographer-grid">
        {cards.map((card) => (
          <article key={card.place} className="home-photographer-card home-traveller-card">
            <Link href={card.href} className="home-photographer-image-link">
              <div className="home-photographer-image">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 1800px) 27vw, (min-width: 900px) 30vw, 90vw"
                  className={`object-cover ${card.imageClassName || ''}`}
                />
              </div>
            </Link>
            <div className="home-traveller-copy">
              <p className="home-traveller-place">{card.place}</p>
              <p className={`home-traveller-body ${card.bodyClassName || ''}`}>{card.body}</p>
            </div>
            <Link href={card.href} className="home-photographer-see-more">
              <span>进一步了解</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

function PhotographerShowcase({ cards }: { cards: PhotographerShowcaseCard[] }) {
  return (
    <section className="home-photographer-section">
      <div className="home-photographer-marquee-wrap" aria-hidden="true">
        <p className="home-photographer-marquee">
          <span>PHOTOGRAPHER&nbsp;&nbsp;</span>
          <span>PHOTOGRAPHER&nbsp;&nbsp;</span>
          <span>PHOTOGRAPHER&nbsp;&nbsp;</span>
        </p>
      </div>

      <div className="site-shell home-photographer-grid">
        {cards.map((card) => (
          <article key={card.title} className="home-photographer-card">
            <h2>
              <Link href={card.href}>{card.title}</Link>
            </h2>
            <Link href={card.href} className="home-photographer-image-link">
              <div className="home-photographer-image">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 1800px) 27vw, (min-width: 900px) 30vw, 90vw"
                  className={`object-cover ${card.imageClassName || ''}`}
                />
              </div>
            </Link>
            <div className="home-photographer-copy">
              <p className="home-photographer-quote">{card.quote}</p>
              <p className="home-photographer-body">{card.body}</p>
            </div>
            <Link href={card.href} className="home-photographer-see-more">
              <span>进一步了解</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
