import Image from 'next/image'
import Link from 'next/link'
import { getProfile } from '@/lib/data/profile'

type PhotographerShowcaseCard = {
  title: string
  href: string
  image: string
  alt: string
  quote: string
  body: string
  imageClassName?: string
}

type TravellerShowcaseCard = {
  place: string
  href: string
  image: string
  alt: string
  body: string
  imageClassName?: string
}

type HobbyistShowcaseCard = {
  title: string
  href: string
  image: string
  alt: string
  body: string
  imageClassName?: string
}

const photographerShowcaseCards: PhotographerShowcaseCard[] = [
  {
    title: 'STREET',
    href: '/photography?category=street',
    image: '/assets/photos/street/street-scene-1.jpg',
    alt: 'Street photography cover',
    quote:
      'Street photography keeps me close to instinct — to observing quietly before trying to explain anything.',
    body: 'I follow fleeting expressions, changing light, and small interactions that shape the pulse of everyday city life.',
  },
  {
    title: 'PET',
    href: '/photography?category=pets',
    image: '/assets/photos/pets/Z52_6039.jpg',
    alt: 'Pet photography cover',
    quote:
      'Pet photography slows the pace down and turns every frame into a record of trust, personality, and companionship.',
    body: 'Rather than staged gestures, I focus on natural movement and the ordinary moments that reveal character over time.',
    imageClassName: 'object-[52%_center]',
  },
  {
    title: 'PROJECT',
    href: '/photography?category=project',
    image: '/assets/photos/project/1.jpg',
    alt: 'Project photography cover',
    quote: 'Long-term projects give isolated observations a clearer direction and a stronger narrative rhythm.',
    body: 'By returning to the same themes across time, each series becomes a structured chapter rather than a single image.',
    imageClassName: 'object-[50%_center]',
  },
]

const travellerShowcaseCards: TravellerShowcaseCard[] = [
  {
    place: '日本',
    href: '/travel/japan',
    image: '/assets/travel/japan-front.jpeg',
    alt: '日本旅行封面',
    body: '旅行不是景点清单，而是把步行、天气和陌生城市重新组织成观看经验。',
    imageClassName: 'object-[56%_center]',
  },
  {
    place: '南京',
    href: '/travel/nanjing',
    image: '/assets/travel/nanjing-hero-wutong-street.jpg',
    alt: '南京旅行封面',
    body: '南京这一页更接近一次缓慢的城市阅读，梧桐、街区与雨天共同定义了它的气质。',
  },
  {
    place: '北京',
    href: '/travel/beijing',
    image: '/assets/travel/beijing-front.jpeg',
    alt: '北京旅行封面',
    body: '北京像一条不断延伸的路径，校园、街口与夜色在同一天里切换尺度。',
    imageClassName: 'object-[56%_center]',
  },
]

const hobbyistShowcaseCards: HobbyistShowcaseCard[] = [
  {
    title: 'BOOK',
    href: '/hobby#reading',
    image: '/assets/home/ward-no-6-cover.jpg',
    alt: 'Book cover',
    body: '阅读让我在影像之外维持另一种缓慢而深入的注意力。',
  },
  {
    title: 'FILM',
    href: '/hobby#film',
    image: '/assets/home/three-colours-trilogy-cover.png',
    alt: 'Film cover',
    body: '电影帮助我重新感受镜头距离、色彩秩序，以及沉默本身的表达力量。',
    imageClassName: 'object-cover object-center scale-[1.05]',
  },
  {
    title: 'VIDEO GAME',
    href: '/hobby#game',
    image: '/assets/home/league-of-legends-cover.jpg',
    alt: 'Video game cover',
    body: '游戏提供的是另一种节奏训练，在判断、协作和重复中建立稳定手感。',
  },
]

export default async function Home() {
  const profile = await getProfile()

  return (
    <div className="home-page">
      <section className="home-band home-band--light home-hero-band">
        <div className="site-shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-overline">林志濠 · 摄影</p>
            <h1>
              摄影，
              <br />
              旅行，
              <br />
              爱好。
            </h1>
            <p className="home-hero-summary">
              常驻杭州，主要拍摄街头、宠物与长期项目，也把旅行与日常兴趣整理成持续更新的记录。
              影像是最先开口的部分，身份与研究背景则留在更安静的边侧。
            </p>
            <p className="home-hero-detail">
              {profile.title} · {profile.city}。{profile.aboutParagraphs[0]}
            </p>
            <div className="home-hero-links">
              <Link href="/photography" className="home-inline-link">
                <span>查看摄影作品</span>
              </Link>
              <Link href="/travel" className="home-inline-link">
                <span>查看旅行记录</span>
              </Link>
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
              <p className="home-hero-name">{profile.name}</p>
              <p className="home-hero-meta">
                {profile.title}
                <br />
                {profile.city}
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      <PhotographerShowcase cards={photographerShowcaseCards} />

      <TravellerShowcase cards={travellerShowcaseCards} />

      <HobbyistShowcase cards={hobbyistShowcaseCards} />
    </div>
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
              <span>SEE MORE</span>
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
              <p className="home-traveller-body">{card.body}</p>
            </div>
            <Link href={card.href} className="home-photographer-see-more">
              <span>SEE MORE</span>
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
              <span>SEE MORE</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
