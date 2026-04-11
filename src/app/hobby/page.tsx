import { getHobby } from '@/lib/data/hobby'
import type { Hobby, HobbyCategory, HobbyItem, MonthlyDigest } from '@/lib/types'
import type { CSSProperties } from 'react'

function formatMonth(month: string) {
  const match = month.match(/^(\d{4})-(\d{1,2})$/)
  if (!match) return month

  return `${match[1]} 年 ${match[2].padStart(2, '0')} 月`
}

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

function SubtleInfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)] px-4 py-2 text-sm text-[color:var(--portfolio-muted)]">
      <span className="font-semibold text-[color:var(--portfolio-text)]">{value}</span>
      <span className="ml-2">{label}</span>
    </div>
  )
}

type EntryTone = {
  panel: string
  badge: string
  item: string
  details: string
}

const entryTones: Record<'reading' | 'film' | 'game', EntryTone> = {
  reading: {
    panel: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)]',
    badge: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-bg)] text-[color:var(--portfolio-muted)]',
    item: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-bg)]',
    details: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-bg)] text-[color:var(--portfolio-muted)]',
  },
  film: {
    panel: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)]',
    badge: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-bg)] text-[color:var(--portfolio-muted)]',
    item: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-bg)]',
    details: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-bg)] text-[color:var(--portfolio-muted)]',
  },
  game: {
    panel: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)]',
    badge: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-bg)] text-[color:var(--portfolio-muted)]',
    item: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-bg)]',
    details: 'border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-bg)] text-[color:var(--portfolio-muted)]',
  },
}

function ItemCard({ item, tone }: { item: HobbyItem; tone: EntryTone }) {
  return (
    <div className={`rounded-2xl border p-5 ${tone.item}`}>
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
  return (
    <article id={anchorId} className={`rounded-[1.7rem] border p-5 sm:p-6 ${tone.panel}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[1.06rem] font-semibold tracking-[-0.015em] text-[color:var(--portfolio-text)]">
          {category.title}
        </h3>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${tone.badge}`}>
          {category.items.length} items
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        {category.items.map((item) => (
          <ItemCard key={item.name} item={item} tone={tone} />
        ))}
      </div>

      {category.title === '游戏' && lolProfile ? <LolProfileModule lolProfile={lolProfile} tone={tone} /> : null}
    </article>
  )
}

function LolProfileModule({
  lolProfile,
  tone,
}: {
  lolProfile: Hobby['lolProfile']
  tone: EntryTone
}) {
  return (
    <section className={`mt-5 rounded-[1.4rem] border p-5 ${tone.details}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoTile label="服务器" value={lolProfile.server} tone={tone} />
        <InfoTile label="段位" value={lolProfile.rank} tone={tone} />
      </div>

      <div className="mt-5">
        <p className="portfolio-eyebrow">主位置</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {lolProfile.mainRoles.map((role) => (
            <span
              key={role}
              className="rounded-full border border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)] px-3 py-1 text-xs font-medium text-[color:var(--portfolio-muted)]"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="portfolio-eyebrow">英雄池</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {lolProfile.championPool.map((champion) => (
            <span
              key={champion}
              className="rounded-full border border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)] px-3 py-1 text-xs font-medium text-[color:var(--portfolio-muted)]"
            >
              {champion}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-6 rounded-xl border border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)] px-4 py-3 text-sm leading-7 text-[color:var(--portfolio-muted)]">
        {lolProfile.currentInsight}
      </p>
    </section>
  )
}

function DigestCard({ monthData }: { monthData: MonthlyDigest }) {
  return (
    <article className="rounded-[1.7rem] border border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[1.06rem] font-semibold tracking-[-0.015em] text-[color:var(--portfolio-text)]">
          {formatMonth(monthData.month)}
        </h3>
        <span className="portfolio-eyebrow">Monthly digest</span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DigestGroup title="阅读" entries={monthData.reading} accent="reading" />
        <DigestGroup title="电影" entries={monthData.films} accent="film" />
      </div>
    </article>
  )
}

function DigestGroup({
  title,
  entries,
  accent,
}: {
  title: string
  entries: HobbyItem[]
  accent: 'reading' | 'film'
}) {
  const tone = entryTones[accent]
  const visibleEntries = entries.slice(0, 2)
  const hiddenEntries = entries.slice(2)

  return (
    <section className={`rounded-2xl border p-4 ${tone.panel}`}>
      <div className="flex items-center justify-between gap-3">
        <h4 className="portfolio-eyebrow text-[color:var(--portfolio-muted)]">{title}</h4>
        <span className="text-xs text-[color:var(--portfolio-soft)]">{entries.length} 条</span>
      </div>

      <ul className="mt-4 space-y-3">
        {visibleEntries.map((entry) => (
          <li key={entry.name} className={`rounded-xl border p-4 ${tone.item}`}>
            <p className="text-sm font-semibold text-[color:var(--portfolio-text)]">{entry.name}</p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--portfolio-muted)]">{entry.why}</p>
          </li>
        ))}
      </ul>

      {hiddenEntries.length ? (
        <details className="group mt-4">
          <summary className="flex cursor-pointer list-none items-center justify-center rounded-xl border border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--portfolio-muted)] transition hover:bg-white/40 dark:hover:bg-white/5">
            <span className="group-open:hidden">查看更多</span>
            <span className="hidden group-open:inline">收起</span>
          </summary>
          <div className="mt-4 space-y-3">
            {hiddenEntries.map((entry) => (
              <div key={entry.name} className={`rounded-xl border p-4 ${tone.item}`}>
                <p className="text-sm font-semibold text-[color:var(--portfolio-text)]">{entry.name}</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--portfolio-muted)]">{entry.why}</p>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  )
}

export default async function HobbyPage() {
  const hobby = await getHobby()
  const categories = hobby.featured?.length ? hobby.featured : hobby.cards
  const digest = sortDigest(hobby.monthlyDigest || [])
  const recentDigest = digest.slice(0, 3)
  const archivedDigest = digest.slice(3)

  const externalLinks = [
    { label: 'Goodreads', href: hobby.externalProfiles.goodreads, description: '完整书单与阅读记录' },
    { label: 'Letterboxd', href: hobby.externalProfiles.letterboxd, description: '完整观影记录与评分' },
  ].filter((entry) => entry.href)

  const stats = [
    { label: '长期入口', value: categories.length.toString() },
    { label: '月度更新', value: digest.length.toString() },
    { label: '外部记录', value: externalLinks.length.toString() },
  ]

  const toneOrder: Array<'reading' | 'film' | 'game'> = ['reading', 'film', 'game']
  const categoryAnchorMap: Record<string, string> = {
    阅读: 'reading',
    电影: 'film',
    游戏: 'game',
  }
  const hobbyThemeVars: CSSProperties = {
    '--portfolio-bg': 'rgba(245, 245, 245, 1)',
    '--portfolio-surface': 'rgba(245, 245, 245, 1)',
    '--portfolio-surface-alt': 'rgba(241, 241, 241, 1)',
    '--portfolio-panel': 'rgba(232, 232, 232, 1)',
    '--portfolio-border': 'rgba(196, 196, 196, 0.9)',
  }

  return (
    <main
      className="relative isolate min-h-screen overflow-hidden bg-[var(--portfolio-bg)] text-[var(--portfolio-text)]"
      style={hobbyThemeVars}
    >
      <div className="portfolio-shell relative py-[clamp(3.5rem,8vw,6.25rem)]">
        <section className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
          <div className="max-w-4xl">
            <p className="portfolio-eyebrow">Hobby</p>
            <h1 className="mt-6 max-w-[17ch] text-[clamp(2.45rem,6vw,4.8rem)] font-semibold leading-[1.25] tracking-[-0.05em] text-[color:var(--portfolio-text)]">
              阅读、电影、游戏，是坚持下来的爱好。
            </h1>
            <p className="mt-7 max-w-3xl text-[1.02rem] leading-8 text-[color:var(--portfolio-muted)] sm:text-[1.08rem]">
              {hobby.intro}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {stats.map((stat) => (
                <SubtleInfoChip key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </div>

          <aside className="rounded-[1.7rem] border border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)] p-5 sm:p-6">
            <p className="portfolio-eyebrow">Snapshot</p>
            <div className="mt-5 grid gap-2.5">
              {categories.map((category) => (
                <div
                  key={category.title}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--portfolio-border)] bg-white/20 px-4 py-3 transition hover:bg-white/35 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
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
        </section>

        <section className="mt-[clamp(3.25rem,7vw,5.25rem)] border-t border-[color:var(--portfolio-border)] pt-[clamp(2.6rem,5.8vw,4.4rem)]">
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

        <section className="mt-[clamp(3.25rem,7vw,5.25rem)] border-t border-[color:var(--portfolio-border)] pt-[clamp(2.6rem,5.8vw,4.4rem)]">
          <div className="space-y-6">
            <SectionLabel
              eyebrow="Monthly digest"
              title="本月更新"
              description="把最近读完的书、看过的电影整理在一起，保留短期兴趣的变化轨迹。"
            />
            <div className="grid gap-5">
              {recentDigest.map((monthData) => (
                <DigestCard key={monthData.month} monthData={monthData} />
              ))}

              {archivedDigest.length ? (
                <details className="group rounded-[1.7rem] border border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)] p-4 sm:p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[1.2rem] border border-[color:var(--portfolio-border)] bg-white/20 px-5 py-4 text-left transition hover:bg-white/35 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
                    <div>
                      <p className="portfolio-eyebrow">Earlier months</p>
                      <p className="mt-2 text-base font-semibold text-[color:var(--portfolio-text)]">展开更早月份</p>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--portfolio-muted)]">
                      <span className="group-open:hidden">查看更多</span>
                      <span className="hidden group-open:inline">收起</span>
                    </span>
                  </summary>

                  <div className="mt-5 grid gap-5">
                    {archivedDigest.map((monthData) => (
                      <DigestCard key={monthData.month} monthData={monthData} />
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-[clamp(3.25rem,7vw,5.25rem)] border-t border-[color:var(--portfolio-border)] pt-[clamp(2.6rem,5.8vw,4.4rem)]">
          <article className="rounded-[1.7rem] border border-[color:var(--portfolio-border)] bg-[color:var(--portfolio-panel)] p-5 sm:p-6">
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
                  className="group rounded-xl border border-[color:var(--portfolio-border)] bg-white/20 p-4 transition hover:bg-white/35 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
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

function InfoTile({ label, value, tone }: { label: string; value: string; tone: EntryTone }) {
  return (
    <div className={`rounded-xl border p-4 ${tone.item}`}>
      <p className="portfolio-eyebrow">{label}</p>
      <p className="mt-2 text-base font-medium text-[color:var(--portfolio-text)]">{value}</p>
    </div>
  )
}
