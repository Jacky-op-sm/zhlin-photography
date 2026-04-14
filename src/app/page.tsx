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
  bodyClassName?: string
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
    title: '街拍',
    href: '/photography?category=street',
    image: '/assets/photos/street/street-scene-1.jpg',
    alt: 'Street photography cover',
    quote: `什么是街拍？
街拍是对城市的观察，
街拍是去展现平日被人忽略的美。`,
    body: `我喜欢去观察光影，
去捕捉人们生存的状态。`,
  },
  {
    title: '动物',
    href: '/photography?category=pets',
    image: '/assets/photos/pets/Z52_6039.jpg',
    alt: 'Pet photography cover',
    quote: `动物给予我感情，
热情的狗，高冷的猫，
关在动物园的老虎。`,
    body: `我最喜欢拍狗狗们，
它们来自故乡，各有个性。`,
    imageClassName: 'object-[52%_center]',
  },
  {
    title: '项目',
    href: '/photography?category=project',
    image: '/assets/photos/project/1.jpg',
    alt: 'Project photography cover',
    quote: `我看着宿舍阳台下的十字路口，
不同的天气，晴天、阴天、下雨，
不同的四季，春夏秋冬。`,
    body: `这是我第一个个人项目，
真期待它会演变成什么样呢？`,
    imageClassName: 'object-[50%_center]',
  },
]

const travellerShowcaseCards: TravellerShowcaseCard[] = [
  {
    place: '日本',
    href: '/travel/japan',
    image: '/assets/travel/japan-front.jpeg',
    alt: '日本旅行封面',
    body: `我记住日本，
不仅因为高松的悠闲、京都的红，
鸭川的夜和奈良的鹿，也因为朋友同行的时光，
以及初识相机时那份欣喜。`,
    imageClassName: 'object-[56%_center]',
    bodyClassName: 'home-traveller-body--japan',
  },
  {
    place: '南京',
    href: '/travel/nanjing',
    image: '/assets/travel/nanjing-hero-wutong-street.jpg',
    alt: '南京旅行封面',
    body: `春节的南京大概不是最好的旅行时机，
可旅行本就不只有轻松和快乐，
也有拥挤、劳累和意外。`,
  },
  {
    place: '北京',
    href: '/travel/beijing',
    image: '/assets/travel/beijing-front.jpeg',
    alt: '北京旅行封面',
    body: `北京给了我太多第一次：
第一次独自旅行，第一次走进音乐酒吧，
第一次在艺术展里结识朋友。`,
    imageClassName: 'object-[56%_center]',
  },
]

const hobbyistShowcaseCards: HobbyistShowcaseCard[] = [
  {
    title: '阅读',
    href: '/hobby#reading',
    image: '/assets/home/ward-no-6-cover.jpg',
    alt: 'Book cover',
    body: `阅读教会我耐心，
让我学会感受契诃夫的温柔、海明威的力量，
和陀思妥耶夫斯基笔下的人心。`,
  },
  {
    title: '电影',
    href: '/hobby#film',
    image: '/assets/home/three-colours-trilogy-cover.png',
    alt: 'Film cover',
    body: `看哪，红白蓝三部曲的美学，
小津安二郎讲述的家庭，今敏的时空跳跃。`,
    imageClassName: 'object-cover object-center scale-[1.05]',
  },
  {
    title: '游戏',
    href: '/hobby#game',
    image: '/assets/home/league-of-legends-cover.jpg',
    alt: 'Video game cover',
    body: `游戏对我到底意味着什么？
是考验反应、团队协作的激情，
还是结束后的疲惫与空虚。`,
  },
]

export default async function Home() {
  const profile = await getProfile()

  return (
    <div className="home-page">
      <section className="home-band home-band--light home-hero-band">
        <div className="site-shell home-hero-grid">
          <div className="home-hero-copy">
            <h1>
              摄影，
              <br />
              旅行，
              <br />
              爱好。
            </h1>
            <p className="home-hero-summary">
              常驻杭州，穷学生一枚。现有三大爱好，摄影 - 已拥有相机三个月，常在散步时拍照，现快门数6897；旅行
              - 走在陌生的地方，看着沿路风景的同时，也看着自己；读书和写作 - 读书培养语感，日记让我自省，游记让我定格回忆。
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
              <p className="home-hero-name">林志濠</p>
              <p className="home-hero-meta">
                在读博士
                <br />
                杭州，中国
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
