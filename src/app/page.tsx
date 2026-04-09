import Image from 'next/image'
import Link from 'next/link'
import { getProfile } from '@/lib/data/profile'

type HomeCard = {
  title: string
  subtitle: string
  description: string
  href: string
  image: string
  alt: string
  imageClassName?: string
}

const photographyCards: HomeCard[] = [
  {
    title: '街拍',
    subtitle: 'Street',
    description: '用一张图先占位，后续可以替换成更完整的项目说明。',
    href: '/photography?category=street',
    image: '/assets/photos/street/street-scene-1.jpg',
    alt: '街拍代表图',
  },
  {
    title: '宠物',
    subtitle: 'Pets',
    description: '先放简短说明，后续可扩写成宠物摄影的拍摄方法与偏好。',
    href: '/photography?category=pets',
    image: '/assets/photos/pets/Z52_6041.jpg',
    alt: '宠物摄影代表图',
  },
  {
    title: '项目',
    subtitle: 'Project',
    description: '作为持续更新的专题入口，这里暂时保留一句简短占位文案。',
    href: '/photography?category=project',
    image: '/assets/photos/project/1.jpg',
    alt: '项目摄影代表图',
  },
]

const travelCards: HomeCard[] = [
  {
    title: '日本',
    subtitle: 'Japan',
    description: '从城市步行到海边航线，先用一句话概括这一组旅行记忆。',
    href: '/travel/japan',
    image: '/assets/travel/japan-front.jpeg',
    alt: '日本游记封面图',
    imageClassName: 'object-[56%_center]',
  },
  {
    title: '南京',
    subtitle: 'Nanjing',
    description: '梧桐、街头和日常细节的组合，文案先保持轻量占位。',
    href: '/travel/nanjing',
    image: '/assets/travel/nanjing-hero-wutong-street.jpg',
    alt: '南京游记封面图',
  },
  {
    title: '北京',
    subtitle: 'Beijing',
    description: '校园、城市与冬天的层次关系，后续可以继续补充完整叙述。',
    href: '/travel/beijing',
    image: '/assets/travel/beijing-front.jpeg',
    alt: '北京游记封面图',
    imageClassName: 'object-[56%_center]',
  },
]

const hobbyCards: HomeCard[] = [
  {
    title: '书籍',
    subtitle: '《第六病室》',
    description: '阅读部分先保留一段短文案，后续可以替换成真实读后感摘录。',
    href: '/hobby',
    image: '/assets/home/ward-no-6-cover.jpg',
    alt: '第六病室封面',
  },
  {
    title: '电影',
    subtitle: '蓝白红三部曲',
    description: '电影部分先放占位说明，后续再补充观看时间与感受。',
    href: '/hobby',
    image: '/assets/home/three-colours-trilogy-cover.png',
    alt: '蓝白红三部曲封面',
  },
  {
    title: 'LOL',
    subtitle: 'League of Legends',
    description: '游戏部分保留一句简短占位，后续可接你现在的 rank 与英雄池。',
    href: '/hobby',
    image: '/assets/home/league-of-legends-cover.jpg',
    alt: '英雄联盟封面',
    imageClassName: 'object-[54%_center]',
  },
]

export default async function Home() {
  const profile = await getProfile()

  return (
    <main className="relative overflow-hidden bg-[#f4efe6] text-[#17110f]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(215,183,144,0.26),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(51,41,32,0.08),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.56),_rgba(244,239,230,0.92))]" />

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-12">
        <div className="grid gap-10 border-b border-[#d3c5b8] pb-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16 lg:pb-20">
          <div className="max-w-xl space-y-6">
            <p className="text-[0.72rem] uppercase tracking-[0.42em] text-[#7b6758]">
              Zhlin Photography
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-[#120d0b] sm:text-5xl lg:text-[4.5rem]">
                在研究、旅行与日常之间，持续记录正在发生的瞬间。
              </h1>
              <p className="text-base leading-8 text-[#4f433a] sm:text-lg">
                {profile.aboutParagraphs[0]}
              </p>
              <p className="text-base leading-8 text-[#4f433a] sm:text-lg">
                {profile.aboutParagraphs[1]}
              </p>
            </div>

            <div className="grid gap-3 border-t border-[#d3c5b8] pt-5 text-sm text-[#4f433a] sm:grid-cols-2">
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.32em] text-[#8a7564]">
                  Name
                </p>
                <p className="mt-2 text-base text-[#17110f]">{profile.name}</p>
              </div>
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.32em] text-[#8a7564]">
                  Base
                </p>
                <p className="mt-2 text-base text-[#17110f]">{profile.city}</p>
              </div>
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.32em] text-[#8a7564]">
                  Role
                </p>
                <p className="mt-2 text-base text-[#17110f]">{profile.title}</p>
              </div>
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.32em] text-[#8a7564]">
                  Contact
                </p>
                <a
                  href={`mailto:${profile.email}`}
                  className="mt-2 inline-block text-base text-[#17110f] underline decoration-[#bea28c] underline-offset-4"
                >
                  {profile.email}
                </a>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[#d3c5b8] bg-[#e8ddd2]">
            <div className="relative aspect-[4/5]">
              <Image
                src={profile.avatar}
                alt={`${profile.name} profile`}
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between border-t border-[#d3c5b8] bg-[#f8f4ee] px-5 py-4">
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.32em] text-[#8a7564]">
                  Profile
                </p>
                <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-[#17110f]">
                  {profile.name}
                </p>
              </div>
              <p className="max-w-[14rem] text-right text-sm leading-6 text-[#5e5248]">
                Photography, travel notes, and visual fragments from everyday life.
              </p>
            </div>
          </div>
        </div>
      </section>

      <EditorialSection
        eyebrow="Photography"
        watermark="PHOTOGRAPHY"
        title="Photography"
        description="街拍、宠物和项目作品，被重新整理成首页上的三张入口卡片，整体节奏尽量贴近参考站的分区方式。"
        cards={photographyCards}
      />

      <EditorialSection
        eyebrow="Travel"
        watermark="TRAVEL"
        title="Travel"
        description="旅行部分直接复用站内封面图，把日本、南京和北京放在同一组横向阅读节奏里。"
        cards={travelCards}
      />

      <EditorialSection
        eyebrow="Hobby"
        watermark="HOBBY"
        title="Hobby"
        description="阅读、电影和 LOL 使用单独封面图进入，先建立结构与视觉比例，文案保持简短占位。"
        cards={hobbyCards}
        isLast
      />
    </main>
  )
}

function EditorialSection({
  eyebrow,
  watermark,
  title,
  description,
  cards,
  isLast = false,
}: {
  eyebrow: string
  watermark: string
  title: string
  description: string
  cards: HomeCard[]
  isLast?: boolean
}) {
  return (
    <section
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
        isLast ? 'pb-16 lg:pb-24' : ''
      }`}
    >
      <div className="relative border-t border-[#d3c5b8] py-14 lg:py-20">
        <p className="pointer-events-none absolute right-0 top-10 hidden text-[clamp(4.5rem,14vw,11rem)] font-semibold tracking-[-0.08em] text-[#d8cec2] lg:block">
          {watermark}
        </p>

        <div className="relative grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
          <div className="max-w-sm space-y-5">
            <p className="text-[0.72rem] uppercase tracking-[0.42em] text-[#7b6758]">
              {eyebrow}
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.06em] text-[#120d0b] sm:text-5xl">
              {title}
            </h2>
            <p className="text-base leading-8 text-[#4f433a] sm:text-lg">
              {description}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <SectionCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionCard({ card }: { card: HomeCard }) {
  return (
    <Link
      href={card.href}
      className="group overflow-hidden rounded-[1.75rem] border border-[#d3c5b8] bg-[#fbf7f1] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#e7ddd0]">
        <Image
          src={card.image}
          alt={card.alt}
          fill
          sizes="(min-width: 1024px) 28vw, (min-width: 768px) 44vw, 100vw"
          className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
            card.imageClassName ?? ''
          }`}
        />
      </div>

      <div className="space-y-3 border-t border-[#d3c5b8] px-5 py-5">
        <p className="text-[0.66rem] uppercase tracking-[0.34em] text-[#8a7564]">
          {card.subtitle}
        </p>
        <h3 className="text-[1.65rem] font-semibold tracking-[-0.05em] text-[#17110f]">
          {card.title}
        </h3>
        <p className="text-sm leading-7 text-[#5d5147]">{card.description}</p>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-[#17110f]">
          View section
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  )
}
