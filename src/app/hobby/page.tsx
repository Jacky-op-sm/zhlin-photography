import { getHobby } from '@/lib/data/hobby'
import Link from 'next/link'
import type { Hobby, HobbyCategory, HobbyItem, MonthlyDigest } from '@/lib/types'
import { Fragment, type CSSProperties } from 'react'
import { extractDigestExcerpt } from '@/lib/utils/hobbyExcerpt'

function monthScore(month: string) {
  const match = month.match(/^(\d{4})-(\d{1,2})$/)
  if (!match) return 0
  return Number(match[1]) * 100 + Number(match[2])
}

function sortDigest(monthlyDigest: MonthlyDigest[]) {
  return [...monthlyDigest].sort((a, b) => monthScore(b.month) - monthScore(a.month))
}

function SectionLabel({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="portfolio-eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-[clamp(1.7rem,3vw,2.55rem)] font-semibold tracking-[-0.04em] text-[color:var(--portfolio-text)]">
        {title}
      </h2>
      <p className="mt-4 text-[0.98rem] leading-8 text-[color:var(--portfolio-muted)] sm:text-[1.02rem]">
        {description}
      </p>
    </div>
  )
}

type EntryTone = {
  panel: string
  item: string
}

const entryTones: Record<'reading' | 'film' | 'game', EntryTone> = {
  reading: {
    panel: 'bg-transparent',
    item: 'bg-[rgba(245,245,247,1)]',
  },
  film: {
    panel: 'bg-transparent',
    item: 'bg-[rgba(245,245,247,1)]',
  },
  game: {
    panel: 'bg-transparent',
    item: 'bg-[rgba(245,245,247,1)]',
  },
}

function ItemCard({ item, tone }: { item: HobbyItem; tone: EntryTone }) {
  return (
    <div className={`rounded-2xl p-5 ${tone.item}`}>
      <h4 className="text-base font-semibold text-[color:var(--portfolio-text)]">{item.name}</h4>
      <p className="mt-3 text-sm leading-7 text-[color:var(--portfolio-muted)]">{item.why}</p>
      {item.rating ? (
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--portfolio-soft)]">
          {item.rating}
        </p>
      ) : null}
      {item.date ? <p className="mt-2 text-xs text-[color:var(--portfolio-soft)]">{item.date}</p> : null}
    </div>
  )
}

function CategoryCard({
  category,
  tone,
  lolProfile,
  anchorId,
}: {
  category: HobbyCategory
  tone: EntryTone
  lolProfile?: Hobby['lolProfile']
  anchorId?: string
}) {
  const isGameCategory = category.title === '游戏' && !!lolProfile

  return (
    <article id={anchorId} className={`flex h-full flex-col rounded-[1.7rem] p-5 sm:p-6 ${tone.panel}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[1.06rem] font-semibold tracking-[-0.015em] text-[color:var(--portfolio-text)]">
          {category.title}
        </h3>
      </div>

      <div className="mt-5 grid gap-4">
        {category.items.map((item) => (
          <ItemCard key={item.name} item={item} tone={tone} />
        ))}
      </div>

      {isGameCategory ? <LolProfileModule lolProfile={lolProfile} className="mt-4 lg:mt-auto" /> : null}
    </article>
  )
}

function LolProfileModule({
  lolProfile,
  className,
}: {
  lolProfile: Hobby['lolProfile']
  className?: string
}) {
  return (
    <section className={`rounded-[1.4rem] bg-[rgba(245,245,247,1)] p-4 ${className ?? 'mt-4'}`}>
      <div className="grid gap-2 sm:grid-cols-2">
        <InfoTile label="服务器" value={lolProfile.server} />
        <InfoTile label="段位" value={lolProfile.rank} />
      </div>

      <div className="mt-4">
        <p className="portfolio-eyebrow">主位置</p>
        <p className="mt-3 text-base font-medium text-[color:var(--portfolio-text)]">{lolProfile.mainRoles.join('、')}</p>
      </div>

      <div className="mt-4">
        <p className="portfolio-eyebrow">英雄池</p>
        <p className="mt-3 text-base font-medium text-[color:var(--portfolio-text)]">{lolProfile.championPool.join('、')}</p>
      </div>

      <p className="mt-4 text-sm leading-7 text-[color:var(--portfolio-muted)]">
        {lolProfile.currentInsight}
      </p>
    </section>
  )
}

function DigestCard({ monthData }: { monthData: MonthlyDigest }) {
  const readingVisible = monthData.reading.slice(0, 2)
  const filmVisible = monthData.films.slice(0, 2)
  const readingHidden = monthData.reading.slice(2)
  const filmHidden = monthData.films.slice(2)
  const visibleRowCount = Math.max(readingVisible.length, filmVisible.length)
  const hiddenRowCount = Math.max(readingHidden.length, filmHidden.length)

  return (
    <article className="p-0">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-base font-semibold tracking-[0.18em] text-[color:var(--portfolio-muted)]">阅读</h4>
          <span className="text-xs text-[color:var(--portfolio-soft)]">{monthData.reading.length} 条</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-base font-semibold tracking-[0.18em] text-[color:var(--portfolio-muted)]">电影</h4>
          <span className="text-xs text-[color:var(--portfolio-soft)]">{monthData.films.length} 条</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2 lg:items-stretch">
        {Array.from({ length: visibleRowCount }).map((_, index) => (
          <Fragment key={`digest-visible-${index}`}>
            {renderDigestRowPair(readingVisible[index], filmVisible[index])}
          </Fragment>
        ))}
      </div>

      {hiddenRowCount > 0 ? (
        <details className="group mt-4">
          <summary className="flex cursor-pointer list-none items-center justify-center px-1 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--portfolio-muted)]">
            <span className="group-open:hidden">查看更多</span>
            <span className="hidden group-open:inline">收起</span>
          </summary>
          <div className="mt-4 grid gap-3 lg:grid-cols-2 lg:items-stretch">
            {Array.from({ length: hiddenRowCount }).map((_, index) => (
              <Fragment key={`digest-hidden-${index}`}>
                {renderDigestRowPair(readingHidden[index], filmHidden[index])}
              </Fragment>
            ))}
          </div>
        </details>
      ) : null}
    </article>
  )
}

function renderDigestEntry(entry: HobbyItem) {
  return (
    <article className="rounded-xl bg-white p-4">
      <p className="text-sm font-semibold text-[color:var(--portfolio-text)]">{entry.name}</p>
      <p className="mt-2 text-sm leading-7 text-[color:var(--portfolio-muted)]">
        {extractDigestExcerpt(entry.fullWhy ?? entry.why)}
      </p>
    </article>
  )
}

function renderDigestRowPair(left?: HobbyItem, right?: HobbyItem) {
  return (
    <>
      {left ? renderDigestEntry(left) : <div aria-hidden className="hidden lg:block" />}
      {right ? renderDigestEntry(right) : <div aria-hidden className="hidden lg:block" />}
    </>
  )
}

export default async function HobbyPage({
  searchParams,
}: {
  searchParams?: { month?: string | string[] }
}) {
  const hobby = await getHobby()
  const categories = hobby.featured?.length ? hobby.featured : hobby.cards
  const digest = sortDigest(hobby.monthlyDigest || [])
  const latestYear = digest[0]?.month.split('-')[0]
  const monthTabs = digest.filter((entry) => {
    const [year, month] = entry.month.split('-')
    return year === latestYear && ['01', '02', '03', '04'].includes(month)
  }).sort((a, b) => monthScore(a.month) - monthScore(b.month))
  const requestedMonth = typeof searchParams?.month === 'string' ? searchParams.month : undefined
  const selectedMonth = monthTabs.some((entry) => entry.month === requestedMonth)
    ? requestedMonth
    : monthTabs[0]?.month
  const selectedDigest = monthTabs.find((entry) => entry.month === selectedMonth)

  const externalLinks = [
    { label: 'Goodreads', href: hobby.externalProfiles.goodreads, description: '完整书单与阅读记录' },
    { label: 'Letterboxd', href: hobby.externalProfiles.letterboxd, description: '完整观影记录与评分' },
  ].filter((entry) => entry.href)

  const toneOrder: Array<'reading' | 'film' | 'game'> = ['reading', 'film', 'game']
  const categoryAnchorMap: Record<string, string> = {
    阅读: 'reading',
    电影: 'film',
    游戏: 'game',
  }
  const hobbyThemeVars: CSSProperties & Record<`--${string}`, string> = {
    '--portfolio-bg': '#ffffff',
    '--portfolio-surface': '#ffffff',
    '--portfolio-surface-alt': '#ffffff',
    '--portfolio-panel': '#ffffff',
    '--portfolio-border': 'rgba(196, 196, 196, 0.9)',
    '--hobby-nested': 'rgba(245, 245, 247, 1)',
  }

  return (
    <main
      className="relative isolate min-h-screen overflow-hidden bg-[var(--portfolio-bg)] text-[var(--portfolio-text)]"
      style={hobbyThemeVars}
    >
      <div className="portfolio-shell relative">
        <section className="relative pb-[clamp(1.8rem,3.6vw,3rem)] pt-[clamp(3.5rem,8vw,6.25rem)]">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-[rgba(245,245,247,1)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
            <div className="max-w-4xl">
              <p className="portfolio-eyebrow">Hobby</p>
              <h1 className="mt-6 max-w-[17ch] text-[clamp(2.45rem,6vw,4.8rem)] font-semibold leading-[1.25] tracking-[-0.05em] text-[color:var(--portfolio-text)]">
                阅读、电影、游戏，是坚持下来的爱好。
              </h1>
              <p className="mt-7 max-w-3xl text-[1.02rem] leading-8 text-[color:var(--portfolio-muted)] sm:text-[1.08rem]">
                {hobby.intro}
              </p>
            </div>

            <aside className="p-5 sm:p-6">
              <p className="portfolio-eyebrow">Snapshot</p>
              <div className="mt-5 grid gap-2.5">
                {categories.map((category) => (
                  <div
                    key={category.title}
                    className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 transition hover:bg-white"
                  >
                    <div>
                      <p className="font-medium text-[color:var(--portfolio-text)]">{category.title}</p>
                      <p className="text-sm text-[color:var(--portfolio-soft)]">{category.items.length} 条精选记录</p>
                    </div>
                    <span className="text-sm text-[color:var(--portfolio-soft)]">→</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="relative mt-[clamp(1.8rem,3.6vw,3rem)] -mx-[var(--portfolio-gutter)] bg-white px-[var(--portfolio-gutter)] pt-[clamp(2.6rem,5.8vw,4.4rem)]">
          <div className="space-y-6">
            <SectionLabel
              eyebrow="Long-term entries"
              title="长期入口"
              description="这些内容不是一次性的清单，而是我会持续回看的三个方向。"
            />
            <div className="grid gap-5 lg:grid-cols-3">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.title}
                  category={category}
                  tone={entryTones[toneOrder[index] ?? 'reading']}
                  lolProfile={category.title === '游戏' ? hobby.lolProfile : undefined}
                  anchorId={categoryAnchorMap[category.title]}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          id="monthly-digest"
          className="relative mt-[clamp(3.25rem,7vw,5.25rem)] pb-[clamp(3.4rem,7.5vw,5.4rem)] pt-[clamp(2.6rem,5.8vw,4.4rem)]"
        >
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-[rgba(245,245,247,1)]" />
          <div className="relative space-y-6">
            <SectionLabel
              eyebrow="Monthly digest"
              title="本月更新"
              description="把最近读完的书、看过的电影整理在一起，保留短期兴趣的变化轨迹。"
            />
            {monthTabs.length ? (
              <div className="inline-flex w-fit flex-wrap items-center gap-1 rounded-full bg-[rgba(232,232,237,1)] p-1.5">
                {monthTabs.map((entry) => {
                  const isActive = entry.month === selectedMonth
                  const monthLabel = `${Number(entry.month.split('-')[1])}月`
                  return (
                    <Link
                      key={entry.month}
                      href={`/hobby?month=${entry.month}#monthly-digest`}
                      className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-[rgba(29,29,31,1)] text-white'
                          : 'text-[rgba(29,29,31,0.88)] hover:bg-white/70'
                      }`}
                    >
                      {monthLabel}
                    </Link>
                  )
                })}
              </div>
            ) : null}
            <div className="grid gap-5">
              {selectedDigest ? <DigestCard monthData={selectedDigest} /> : null}
            </div>
          </div>
        </section>

        <section className="mt-[clamp(3.25rem,7vw,5.25rem)] bg-white pt-[clamp(2.6rem,5.8vw,4.4rem)]">
          <article className="p-0">
            <SectionLabel
              eyebrow="External links"
              title="外部链接"
              description="更完整的阅读和观影轨迹放在第三方平台维护，这里只保留入口。"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {externalLinks.map((entry) => (
                <a
                  key={entry.label}
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl bg-[rgba(245,245,247,1)] p-4 transition hover:bg-[rgba(245,245,247,1)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-[color:var(--portfolio-text)]">{entry.label}</p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--portfolio-muted)]">{entry.description}</p>
                    </div>
                    <span className="text-[color:var(--portfolio-soft)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[rgba(245,245,247,1)]">
      <p className="portfolio-eyebrow">{label}</p>
      <p className="mt-3 text-base font-medium text-[color:var(--portfolio-text)]">{value}</p>
    </div>
  )
}
