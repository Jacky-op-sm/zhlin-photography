import Image from 'next/image'
import { getProfile } from '@/lib/data/profile'
import IntroBlock from '@/components/home/IntroBlock'
import PortfolioPreviewCard from '@/components/home/PortfolioPreviewCard'
import SectionHeading from '@/components/home/SectionHeading'

type ShowcaseCard = {
  title: string
  href: string
  image: string
  alt: string
  lead: string
  body: string
  imageClassName?: string
}

const photographyCards: ShowcaseCard[] = [
  {
    title: 'STREET',
    href: '/photography?category=street',
    image: '/assets/photos/street/street-scene-1.jpg',
    alt: 'Street photography cover',
    lead: '在拥挤与擦肩之间，街头摄影让我持续练习如何更准确地观看。',
    body: '我更关心路人之间短暂的关系、光线落下的位置，以及城市节奏在一个瞬间里的浓缩。',
  },
  {
    title: 'PETS',
    href: '/photography?category=pets',
    image: '/assets/photos/pets/Z52_6041.jpg',
    alt: 'Pets photography cover',
    lead: '镜头靠近之后，宠物摄影变成一种更缓慢、更信任彼此的记录方式。',
    body: '这些照片不追求夸张姿态，而是保留陪伴感、性格和日常动作里最自然的部分。',
  },
  {
    title: 'PROJECT',
    href: '/photography?category=project',
    image: '/assets/photos/project/1.jpg',
    alt: 'Project photography cover',
    lead: '长期项目把零散的观察整理成章节，让反复回看的线索逐渐成形。',
    body: '每一组影像都围绕同一主题持续推进，关注时间、场景与人物之间更稳定的联系。',
  },
]

const travelCards: ShowcaseCard[] = [
  {
    title: 'JAPAN',
    href: '/travel/japan',
    image: '/assets/travel/japan-front.jpeg',
    alt: 'Japan travel cover',
    lead: '旅行不是景点清单，而是把步行、天气和陌生城市重新组织成观看经验。',
    body: '从车站、海岸到街角店铺，旅途中留下的更多是节奏感与空间气味。',
    imageClassName: 'object-[56%_center]',
  },
  {
    title: 'NANJING',
    href: '/travel/nanjing',
    image: '/assets/travel/nanjing-hero-wutong-street.jpg',
    alt: 'Nanjing travel cover',
    lead: '南京这一页更接近一次缓慢的城市阅读，梧桐、街区与雨天共同定义了它的气质。',
    body: '我把熟悉与陌生放在同一条路线里，记录建筑表面之外更具体的生活温度。',
  },
  {
    title: 'BEIJING',
    href: '/travel/beijing',
    image: '/assets/travel/beijing-front.jpeg',
    alt: 'Beijing travel cover',
    lead: '北京像一条不断延伸的路径，校园、街口与夜色在同一天里切换尺度。',
    body: '这组旅行照片更关注人与城市关系的变化，而不只停留在地标式观看。',
    imageClassName: 'object-[56%_center]',
  },
]

const hobbyCards: ShowcaseCard[] = [
  {
    title: 'BOOKS',
    href: '/hobby',
    image: '/assets/home/ward-no-6-cover.jpg',
    alt: 'Ward No.6 book cover',
    lead: '阅读让我在影像之外维持另一种缓慢而深入的注意力。',
    body: '书页里的结构、语气和细节感，常常会反过来影响我理解照片与叙事的方式。',
    imageClassName: 'object-contain bg-[#ede7dc] p-6 dark:bg-[#2a241d]',
  },
  {
    title: 'FILMS',
    href: '/hobby',
    image: '/assets/home/three-colours-trilogy-cover.png',
    alt: 'Three Colours trilogy cover',
    lead: '电影帮助我重新感受镜头距离、色彩秩序，以及沉默本身的表达力量。',
    body: '这些观影笔记更像个人的观看存档，记录那些持续停留在脑海里的场面。',
    imageClassName: 'object-contain bg-[#ece8e0] p-5 dark:bg-[#26221b]',
  },
  {
    title: 'LOL',
    href: '/hobby',
    image: '/assets/home/league-of-legends-cover.jpg',
    alt: 'League of Legends cover',
    lead: '游戏提供的是另一种节奏训练，在判断、协作和重复中建立稳定的手感。',
    body: '它并不与摄影分离，反而让我更敏感地意识到专注、反应与长期练习的价值。',
    imageClassName: 'object-[54%_center]',
  },
]

export default async function Home() {
  const profile = await getProfile()

  return (
    <div className="min-h-screen bg-[color:var(--portfolio-bg)] text-[color:var(--portfolio-text)]">
      <section className="portfolio-hero relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.42),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(126,96,62,0.12),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(215,198,172,0.08),transparent_42%)]" />
        <div className="portfolio-shell relative">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_18rem] lg:items-end lg:gap-16 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <IntroBlock
              eyebrow="Zhlin Photography"
              title={
                <>
                  Images,
                  <br />
                  journeys,
                  <br />
                  daily notes.
                </>
              }
              summary="常驻杭州，主要拍摄街头、宠物与长期项目，也把旅行与日常兴趣整理成持续更新的记录。影像是最先开口的部分，身份与研究背景则留在更安静的边侧。"
              detail={`${profile.title} · ${profile.city}。${profile.aboutParagraphs[0]}`}
              primaryHref="/photography"
              primaryLabel="See photography"
              secondaryHref="/travel"
              secondaryLabel="See travel"
            />

            <figure className="portfolio-panel mx-auto w-full max-w-[18rem] overflow-hidden lg:mx-0 lg:justify-self-end xl:max-w-[20rem]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[inherit]">
                <Image
                  src={profile.avatar}
                  alt={`${profile.name} profile`}
                  fill
                  priority
                  sizes="(min-width: 1280px) 20rem, (min-width: 1024px) 18rem, (min-width: 640px) 22rem, 78vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="border-t border-[color:var(--portfolio-border)] px-5 py-5 sm:px-6">
                <p className="portfolio-eyebrow">Profile</p>
                <p className="mt-3 text-[1.75rem] font-semibold tracking-[-0.04em] text-[color:var(--portfolio-text)]">
                  {profile.name}
                </p>
                <p className="mt-2 text-[0.92rem] leading-7 text-[color:var(--portfolio-muted)]">
                  {profile.title}
                  <br />
                  {profile.city}
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <HomeSection
        tone="surface"
        marquee="PHOTOGRAPHER"
        eyebrow="Selected Work"
        title="摄影仍然是首页最先抵达的入口。"
        description="以街头、宠物与长期项目构成当前的首页主轴。图片先开口，文字只负责补充观看的方向与语气。"
        cards={photographyCards}
      />

      <HomeSection
        tone="alt"
        marquee="TRAVELER"
        eyebrow="Field Notes"
        title="旅行页面延伸了摄影之外的观看尺度。"
        description="我更关注旅途中被步行节奏重新组织起来的城市经验，而不是一次性的到访清单。"
        cards={travelCards}
      />

      <HomeSection
        tone="surface"
        marquee="HOBBYIST"
        eyebrow="Off The Frame"
        title="阅读、电影与游戏构成镜头之外的日常节奏。"
        description="这些内容不是附属栏目，而是持续影响拍摄方式、审美判断与叙事习惯的另一条线索。"
        cards={hobbyCards}
        isLast
      />
    </div>
  )
}

function HomeSection({
  tone,
  marquee,
  eyebrow,
  title,
  description,
  cards,
  isLast = false,
}: {
  tone: 'surface' | 'alt'
  marquee: string
  eyebrow: string
  title: string
  description: string
  cards: ShowcaseCard[]
  isLast?: boolean
}) {
  return (
    <section
      className={`portfolio-section ${tone === 'alt' ? 'bg-[color:var(--portfolio-surface-alt)]' : 'bg-[color:var(--portfolio-surface)]'} ${
        isLast ? 'pb-[var(--portfolio-section-space)]' : ''
      }`}
    >
      <div className="portfolio-shell">
        <SectionHeading
          marquee={marquee}
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <div className="grid gap-y-16 md:grid-cols-2 md:gap-x-10 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-20">
          {cards.map((card) => (
            <PortfolioPreviewCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
