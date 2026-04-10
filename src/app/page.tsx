import Image from 'next/image'
import Link from 'next/link'
import { getProfile } from '@/lib/data/profile'

type SectionCard = {
  title: string
  href: string
  image: string
  alt: string
  lead: string
  body: string
  imageClassName?: string
}

const photographyCards: SectionCard[] = [
  {
    title: 'Street',
    href: '/photography?category=street',
    image: '/assets/photos/street/street-scene-1.jpg',
    alt: 'Street photography cover',
    lead: '在拥挤与擦肩之间，街头摄影让我持续练习如何更准确地观看。',
    body: '我更关心路人之间短暂的关系、光线落下的位置，以及城市节奏在一个瞬间里的浓缩。',
  },
  {
    title: 'Pets',
    href: '/photography?category=pets',
    image: '/assets/photos/pets/Z52_6041.jpg',
    alt: 'Pets photography cover',
    lead: '镜头靠近之后，宠物摄影变成一种更缓慢、更信任彼此的记录方式。',
    body: '这些照片不追求夸张姿态，而是保留陪伴感、性格和日常动作里最自然的部分。',
  },
  {
    title: 'Project',
    href: '/photography?category=project',
    image: '/assets/photos/project/1.jpg',
    alt: 'Project photography cover',
    lead: '长期项目把零散观察整理成章节，让反复回看的线索逐渐成形。',
    body: '每一组影像都围绕同一主题持续推进，关注时间、场景与人物之间更稳定的联系。',
  },
]

const travelCards: SectionCard[] = [
  {
    title: 'Japan',
    href: '/travel/japan',
    image: '/assets/travel/japan-front.jpeg',
    alt: 'Japan travel cover',
    lead: '旅行不是景点清单，而是把步行、天气和陌生城市重新组织成观看经验。',
    body: '从车站、海岸到街角店铺，旅途中留下的更多是节奏感与空间气味。',
    imageClassName: 'object-[56%_center]',
  },
  {
    title: 'Nanjing',
    href: '/travel/nanjing',
    image: '/assets/travel/nanjing-hero-wutong-street.jpg',
    alt: 'Nanjing travel cover',
    lead: '南京这一页更接近一次缓慢的城市阅读，梧桐、街区与雨天共同定义了它的气质。',
    body: '我把熟悉与陌生放在同一条路线里，记录建筑表面之外更具体的生活温度。',
  },
  {
    title: 'Beijing',
    href: '/travel/beijing',
    image: '/assets/travel/beijing-front.jpeg',
    alt: 'Beijing travel cover',
    lead: '北京像一条不断延伸的路径，校园、街口与夜色在同一天里切换尺度。',
    body: '这组旅行照片更关注人与城市关系的变化，而不只停留在地标式观看。',
    imageClassName: 'object-[56%_center]',
  },
]

const hobbyCards: SectionCard[] = [
  {
    title: 'Books',
    href: '/hobby',
    image: '/assets/home/ward-no-6-cover.jpg',
    alt: 'Ward No.6 book cover',
    lead: '阅读让我在影像之外维持另一种缓慢而深入的注意力。',
    body: '书页里的结构、语气和细节感，常常会反过来影响我理解照片与叙事的方式。',
    imageClassName: 'object-contain bg-[#ede7dc] p-6',
  },
  {
    title: 'Films',
    href: '/hobby',
    image: '/assets/home/three-colours-trilogy-cover.png',
    alt: 'Three Colours trilogy cover',
    lead: '电影帮助我重新感受镜头距离、色彩秩序，以及沉默本身的表达力量。',
    body: '这些观影笔记更像个人的观看存档，记录那些持续停留在脑海里的场面。',
    imageClassName: 'object-contain bg-[#ece8e0] p-5',
  },
  {
    title: 'LOL',
    href: '/hobby',
    image: '/assets/home/league-of-legends-cover.jpg',
    alt: 'League of Legends cover',
    lead: '游戏提供的是另一种节奏训练，在判断、协作和重复中建立稳定手感。',
    body: '它并不与摄影分离，反而让我更敏感地意识到专注、反应与长期练习的价值。',
    imageClassName: 'object-[54%_center]',
  },
]

export default async function Home() {
  const profile = await getProfile()

  return (
    <div className="home-page">
      <section className="home-band home-band--light home-hero-band">
        <div className="site-shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-overline">Zhlin Photography</p>
            <h1>
              Images,
              <br />
              journeys,
              <br />
              daily notes.
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
                <span>See photography</span>
              </Link>
              <Link href="/travel" className="home-inline-link">
                <span>See travel</span>
              </Link>
            </div>
          </div>

          <figure className="home-hero-panel">
            <div className="home-hero-image-wrap">
              <Image
                src={profile.avatar}
                alt={`${profile.name} profile`}
                fill
                priority
                sizes="(min-width: 1280px) 22rem, (min-width: 768px) 20rem, 82vw"
                className="object-cover"
              />
            </div>
            <figcaption>
              <p className="home-overline">Profile</p>
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

      <LandingSection
        tone="white"
        overline="Photography"
        title="摄影仍然是首页最先抵达的入口。"
        description="以街头、宠物与长期项目构成当前主页主轴。图片先开口，文字只负责补充观看方向与语气。"
        cards={photographyCards}
      />

      <LandingSection
        tone="light"
        overline="Travel"
        title="旅行页面延伸了摄影之外的观看尺度。"
        description="我更关注旅途中被步行节奏重新组织起来的城市经验，而不是一次性的到访清单。"
        cards={travelCards}
      />

      <LandingSection
        tone="white"
        overline="Off The Frame"
        title="阅读、电影与游戏构成镜头之外的日常节奏。"
        description="这些内容不是附属栏目，而是持续影响拍摄方式、审美判断与叙事习惯的另一条线索。"
        cards={hobbyCards}
      />
    </div>
  )
}

function LandingSection({
  tone,
  overline,
  title,
  description,
  cards,
}: {
  tone: 'light' | 'white'
  overline: string
  title: string
  description: string
  cards: SectionCard[]
}) {
  return (
    <section className={`home-band ${tone === 'light' ? 'home-band--light' : 'home-band--white'}`}>
      <div className="site-shell">
        <header className="home-section-head">
          <p className="home-overline">{overline}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </header>

        <div className="home-feature-grid">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className={`home-feature-card ${index === 0 ? 'home-feature-card--primary' : ''}`}
            >
              <Link href={card.href} className="home-feature-image-link">
                <div className="home-feature-image">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 768px) 42vw, 90vw"
                    className={`object-cover ${card.imageClassName || ''}`}
                  />
                </div>
              </Link>

              <div className="home-feature-body">
                <p className="home-feature-title">{card.title}</p>
                <p className="home-feature-lead">{card.lead}</p>
                <p className="home-feature-text">{card.body}</p>
                <Link href={card.href} className="home-inline-link">
                  <span>See more</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
