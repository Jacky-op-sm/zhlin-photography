import Image from 'next/image'
import Link from 'next/link'
import { getProfile } from '@/lib/data/profile'

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
    lead: '街拍是我最自然的观察方式。',
    body: '先放简短说明，后续你可补充完整项目叙事。',
  },
  {
    title: 'PETS',
    href: '/photography?category=pets',
    image: '/assets/photos/pets/Z52_6041.jpg',
    alt: 'Pets photography cover',
    lead: '宠物摄影记录更慢、更近的情绪。',
    body: '先放短文案占位，后续你可补完整说明。',
  },
  {
    title: 'PROJECT',
    href: '/photography?category=project',
    image: '/assets/photos/project/1.jpg',
    alt: 'Project photography cover',
    lead: '项目是我长期反复回看的章节。',
    body: '保持简短占位，后续再补每个项目的背景。',
  },
]

const travelCards: ShowcaseCard[] = [
  {
    title: 'JAPAN',
    href: '/travel/japan',
    image: '/assets/travel/japan-front.jpeg',
    alt: 'Japan travel cover',
    lead: '城市、海线和步行记忆被放在同一页。',
    body: '先用一句话占位，后续你可补充完整游记导语。',
    imageClassName: 'object-[56%_center]',
  },
  {
    title: 'NANJING',
    href: '/travel/nanjing',
    image: '/assets/travel/nanjing-hero-wutong-street.jpg',
    alt: 'Nanjing travel cover',
    lead: '梧桐、街头和雨天构成这次南京的底色。',
    body: '这里先保留简短文案，后续可补完整摘要。',
  },
  {
    title: 'BEIJING',
    href: '/travel/beijing',
    image: '/assets/travel/beijing-front.jpeg',
    alt: 'Beijing travel cover',
    lead: '校园和城市节奏在同一条线路里展开。',
    body: '当前先用占位文案，后续你可补上具体叙事。',
    imageClassName: 'object-[56%_center]',
  },
]

const hobbyCards: ShowcaseCard[] = [
  {
    title: 'BOOKS',
    href: '/hobby',
    image: '/assets/home/ward-no-6-cover.jpg',
    alt: 'Ward No.6 book cover',
    lead: '最近读完《第六病室》，先以封面作为入口。',
    body: '后续你可补上读后感和关键摘录。',
    imageClassName: 'object-contain bg-[#ede7dc]',
  },
  {
    title: 'FILMS',
    href: '/hobby',
    image: '/assets/home/three-colours-trilogy-cover.png',
    alt: 'Three Colours trilogy cover',
    lead: '电影以蓝白红三部曲作为当前入口。',
    body: '先保留一段短文案，后续你可补充观影笔记。',
    imageClassName: 'object-contain bg-[#ece8e0] p-4',
  },
  {
    title: 'LOL',
    href: '/hobby',
    image: '/assets/home/league-of-legends-cover.jpg',
    alt: 'League of Legends cover',
    lead: '游戏部分暂以英雄联盟封面作为固定入口。',
    body: '后续可补段位、英雄池和赛季记录。',
    imageClassName: 'object-[54%_center]',
  },
]

export default async function Home() {
  const profile = await getProfile()

  return (
    <main className="bg-[#efefef] text-black">
      <section className="mx-auto max-w-[1550px] px-6 pb-16 pt-10 sm:px-10 lg:pb-24 lg:pt-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_34rem] lg:items-end lg:gap-16">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-black/45">
              Zhlin Photography
            </p>
            <h1 className="mt-6 text-[clamp(2.3rem,5.8vw,5.2rem)] font-black leading-[0.92] tracking-[-0.045em]">
              在研究、旅行与日常之间，
              <br />
              持续记录正在发生的瞬间。
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-9 text-black/75">{profile.aboutParagraphs[0]}</p>
            <p className="mt-5 max-w-2xl text-lg leading-9 text-black/75">{profile.aboutParagraphs[1]}</p>
          </div>

          <figure className="overflow-hidden rounded-[2rem] border border-black/12 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)]">
            <div className="relative aspect-[4/5]">
              <Image
                src={profile.avatar}
                alt={`${profile.name} profile`}
                fill
                priority
                sizes="(min-width: 1280px) 34rem, (min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="border-t border-black/10 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-black/45">Profile</p>
              <p className="mt-2 text-2xl font-bold tracking-[-0.03em]">{profile.name}</p>
              <p className="mt-2 text-sm text-black/65">{profile.title} · {profile.city}</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <ShowcaseSection
        marquee="PHOTOGRAPHER"
        cards={photographyCards}
      />

      <ShowcaseSection
        marquee="TRAVEL"
        cards={travelCards}
      />

      <ShowcaseSection
        marquee="HOBBY"
        cards={hobbyCards}
        isLast
      />
    </main>
  )
}

function ShowcaseSection({
  marquee,
  cards,
  isLast = false,
}: {
  marquee: string
  cards: ShowcaseCard[]
  isLast?: boolean
}) {
  return (
    <section className={`mx-auto max-w-[1550px] px-6 sm:px-10 ${isLast ? 'pb-20 lg:pb-28' : 'pb-12 lg:pb-16'}`}>
      <div className="overflow-hidden">
        <h2 className="whitespace-nowrap text-[clamp(3rem,8.8vw,8.6rem)] font-black uppercase leading-none tracking-[-0.045em]">
          <span className="text-black/10">{marquee}</span>{' '}
          <span className="text-black">{marquee}</span>{' '}
          <span className="text-black/12">{marquee}</span>
        </h2>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2 xl:mt-12 xl:grid-cols-3 xl:gap-12">
        {cards.map((card) => (
          <ShowcaseCardItem key={card.title} card={card} />
        ))}
      </div>
    </section>
  )
}

function ShowcaseCardItem({ card }: { card: ShowcaseCard }) {
  return (
    <Link href={card.href} className="group block">
      <h3 className="text-center text-[2.1rem] font-black uppercase tracking-[-0.02em] text-black">
        {card.title}
      </h3>

      <div className="mt-8">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#e7e7e7] shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          <Image
            src={card.image}
            alt={card.alt}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
            className={`object-cover transition duration-700 group-hover:scale-[1.03] ${card.imageClassName ?? ''}`}
          />
        </div>

        <p className="mx-auto mt-9 max-w-[28rem] text-center font-serif text-[1.95rem] italic leading-[1.35] tracking-[-0.01em] text-black/85">
          {card.lead}
        </p>
        <p className="mx-auto mt-6 max-w-[28rem] text-center text-[1.12rem] leading-9 text-black/72">
          {card.body}
        </p>
      </div>
    </Link>
  )
}
