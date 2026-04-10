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
    <main className="bg-[#d7cebf] text-black">
      <section className="bg-[#d7cebf]">
        <div className="mx-auto max-w-[1320px] px-6 py-14 sm:px-10 sm:py-[4.5rem] lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-center lg:gap-14 xl:grid-cols-[minmax(0,1fr)_25rem]">
            <div className="mx-auto max-w-[38rem] lg:mx-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-black/45">
                Zhlin Photography
              </p>
              <h1 className="mt-5 text-[clamp(2rem,5vw,4.35rem)] font-black leading-[0.94] tracking-[-0.045em]">
                在研究、旅行与日常之间，
                <br />
                持续记录正在发生的瞬间。
              </h1>
              <p className="mt-6 max-w-[34rem] text-[1rem] leading-8 text-black/72 sm:text-[1.04rem]">
                {profile.aboutParagraphs[0]}
              </p>
              <p className="mt-4 max-w-[34rem] text-[1rem] leading-8 text-black/72 sm:text-[1.04rem]">
                {profile.aboutParagraphs[1]}
              </p>
            </div>

            <figure className="mx-auto w-full max-w-[20rem] overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#f5f1e8] shadow-[0_18px_50px_rgba(0,0,0,0.08)] sm:max-w-[22rem] lg:justify-self-end">
              <div className="relative aspect-[4/5]">
                <Image
                  src={profile.avatar}
                  alt={`${profile.name} profile`}
                  fill
                  priority
                  sizes="(min-width: 1280px) 25rem, (min-width: 1024px) 23rem, (min-width: 640px) 22rem, 80vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="border-t border-black/10 px-5 py-4 sm:px-6">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-black/45">Profile</p>
                <p className="mt-1.5 text-[1.55rem] font-bold tracking-[-0.03em]">{profile.name}</p>
                <p className="mt-1.5 text-[0.82rem] uppercase tracking-[0.12em] text-black/58">
                  {profile.title} · {profile.city}
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <ShowcaseSection
        marquee="PHOTOGRAPHER"
        cards={photographyCards}
        tone="light"
      />

      <ShowcaseSection
        marquee="TRAVEL"
        cards={travelCards}
        tone="warm"
      />

      <ShowcaseSection
        marquee="HOBBY"
        cards={hobbyCards}
        tone="light"
        isLast
      />
    </main>
  )
}

function ShowcaseSection({
  marquee,
  cards,
  tone,
  isLast = false,
}: {
  marquee: string
  cards: ShowcaseCard[]
  tone: 'warm' | 'light'
  isLast?: boolean
}) {
  const sectionClassName =
    tone === 'warm'
      ? 'bg-[#d7cebf] border-t border-black/8'
      : 'bg-[#f4f0e8] border-t border-black/8'

  return (
    <section className={sectionClassName}>
      <div className={`mx-auto max-w-[1320px] px-6 pt-14 sm:px-10 sm:pt-16 lg:pt-20 ${isLast ? 'pb-[4.5rem] sm:pb-20 lg:pb-24' : 'pb-16 sm:pb-[4.5rem] lg:pb-20'}`}>
        <div className="overflow-hidden">
          <h2 className="whitespace-nowrap text-[clamp(2.8rem,8vw,6.8rem)] font-black uppercase leading-none tracking-[-0.05em]">
            <span className="text-black/10">{marquee}</span>{' '}
            <span className="text-black">{marquee}</span>{' '}
            <span className="text-black/12">{marquee}</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-y-14 md:grid-cols-2 md:gap-x-10 lg:mt-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
          {cards.map((card) => (
            <ShowcaseCardItem key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ShowcaseCardItem({ card }: { card: ShowcaseCard }) {
  return (
    <Link href={card.href} className="group mx-auto block w-full max-w-[18.5rem] sm:max-w-[19.5rem] xl:max-w-[20rem]">
      <h3 className="text-center text-[1.22rem] font-black uppercase tracking-[0.08em] text-black sm:text-[1.28rem]">
        {card.title}
      </h3>

      <div className="mt-5">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.55rem] bg-[#e6e1d8] shadow-[0_16px_34px_rgba(0,0,0,0.08)]">
          <Image
            src={card.image}
            alt={card.alt}
            fill
            sizes="(min-width: 1280px) 20rem, (min-width: 1024px) 18rem, (min-width: 768px) 42vw, 78vw"
            className={`object-cover transition duration-700 group-hover:scale-[1.02] ${card.imageClassName ?? ''}`}
          />
        </div>

        <p className="mx-auto mt-5 max-w-[17rem] text-center font-serif text-[1.16rem] italic leading-[1.55] tracking-[-0.01em] text-black/82 sm:text-[1.2rem]">
          {card.lead}
        </p>
        <p className="mx-auto mt-4 max-w-[17rem] text-center text-[0.94rem] leading-7 text-black/68">
          {card.body}
        </p>
      </div>
    </Link>
  )
}
