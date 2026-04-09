import { getHobby } from '@/lib/data/hobby'
import type { Hobby, HobbyCategory, HobbyItem, MonthlyDigest } from '@/lib/types'

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
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-neutral-600 sm:text-base">
        {description}
      </p>
    </div>
  )
}

function ItemCard({
  item,
  tone = 'neutral',
}: {
  item: HobbyItem
  tone?: 'neutral' | 'amber' | 'rose' | 'emerald'
}) {
  const toneClassName =
    tone === 'amber'
      ? 'border-amber-200/70 bg-amber-50/80 text-amber-950'
      : tone === 'rose'
        ? 'border-rose-200/70 bg-rose-50/80 text-rose-950'
        : tone === 'emerald'
          ? 'border-emerald-200/70 bg-emerald-50/80 text-emerald-950'
          : 'border-neutral-200/80 bg-white/75 text-neutral-950'

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClassName}`}>
      <h4 className="text-base font-semibold">{item.name}</h4>
      <p className="mt-3 text-sm leading-7 text-inherit/80">{item.why}</p>
      {item.rating ? (
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-inherit/60">
          {item.rating}
        </p>
      ) : null}
      {item.date ? (
        <p className="mt-2 text-xs text-inherit/55">{item.date}</p>
      ) : null}
    </div>
  )
}

function CategoryCard({
  category,
  tone,
  lolProfile,
}: {
  category: HobbyCategory
  tone: 'amber' | 'rose' | 'emerald'
  lolProfile?: Hobby['lolProfile']
}) {
  const toneClassName =
    tone === 'amber'
      ? 'from-amber-50 via-white to-white border-amber-200/70'
      : tone === 'rose'
        ? 'from-rose-50 via-white to-white border-rose-200/70'
        : 'from-emerald-50 via-white to-white border-emerald-200/70'

  return (
    <article className={`rounded-[2rem] border bg-gradient-to-br p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)] ${toneClassName}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-neutral-950">{category.title}</h3>
        <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
          {category.items.length} items
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        {category.items.map((item) => (
          <ItemCard
            key={item.name}
            item={item}
            tone={tone === 'amber' ? 'amber' : tone === 'rose' ? 'rose' : 'emerald'}
          />
        ))}
      </div>

      {category.title === '游戏' && lolProfile ? <LolProfileModule lolProfile={lolProfile} /> : null}
    </article>
  )
}

function LolProfileModule({ lolProfile }: { lolProfile: Hobby['lolProfile'] }) {
  return (
    <section className="mt-5 rounded-[1.75rem] border border-neutral-200/80 bg-white/75 p-5 text-neutral-950 shadow-sm backdrop-blur">
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoTile label="服务器" value={lolProfile.server} />
        <InfoTile label="段位" value={lolProfile.rank} />
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
          主位置
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {lolProfile.mainRoles.map((role) => (
            <span
              key={role}
              className="rounded-full border border-neutral-200/80 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
          英雄池
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {lolProfile.championPool.map((champion) => (
            <span
              key={champion}
              className="rounded-full border border-neutral-200/80 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700"
            >
              {champion}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-6 rounded-2xl border border-neutral-200/80 bg-neutral-50 p-4 text-sm leading-7 text-neutral-700">
        {lolProfile.currentInsight}
      </p>
    </section>
  )
}

function DigestCard({ monthData }: { monthData: MonthlyDigest }) {
  return (
    <article className="rounded-[2rem] border border-neutral-200/80 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-neutral-950">
          {formatMonth(monthData.month)}
        </h3>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
          Monthly Digest
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <DigestGroup title="阅读" entries={monthData.reading} accent="amber" />
        <DigestGroup title="电影" entries={monthData.films} accent="rose" />
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
  accent: 'amber' | 'rose'
}) {
  const accentClassName =
    accent === 'amber'
      ? 'border-amber-200/70 bg-amber-50/70 text-amber-950'
      : 'border-rose-200/70 bg-rose-50/70 text-rose-950'
  const visibleEntries = entries.slice(0, 2)
  const hiddenEntries = entries.slice(2)

  return (
    <section className={`rounded-2xl border p-4 ${accentClassName}`}>
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.24em]">{title}</h4>
        <span className="text-xs text-inherit/55">{entries.length} 条</span>
      </div>

      <ul className="mt-4 space-y-4">
        {visibleEntries.map((entry) => (
          <li key={entry.name} className="rounded-xl bg-white/65 p-4 shadow-sm">
            <p className="text-sm font-semibold text-neutral-950">{entry.name}</p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">{entry.why}</p>
          </li>
        ))}
      </ul>

      {hiddenEntries.length ? (
        <details className="group mt-4">
          <summary className="flex cursor-pointer list-none items-center justify-center rounded-xl border border-current/20 bg-white/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-current transition hover:bg-white/75">
            <span className="group-open:hidden">查看更多</span>
            <span className="hidden group-open:inline">收起</span>
          </summary>
          <div className="mt-4 space-y-4">
            {hiddenEntries.map((entry) => (
              <div key={entry.name} className="rounded-xl bg-white/65 p-4 shadow-sm">
                <p className="text-sm font-semibold text-neutral-950">{entry.name}</p>
                <p className="mt-2 text-sm leading-7 text-neutral-700">{entry.why}</p>
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

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.12),_transparent_30%),linear-gradient(180deg,_#fafafa_0%,_#f4f5f7_100%)] text-neutral-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0))]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
              Hobby
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
              阅读、电影、游戏，都是我持续观察世界的入口。
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-600 sm:text-lg">
              {hobby.intro}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-full border border-neutral-200/80 bg-white/80 px-4 py-2 text-sm text-neutral-700 shadow-sm backdrop-blur"
                >
                  <span className="font-semibold text-neutral-950">{stat.value}</span>
                  <span className="ml-2 text-neutral-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-neutral-200/80 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
              Snapshot
            </p>
            <div className="mt-5 grid gap-3">
              {categories.map((category) => (
                <div
                  key={category.title}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200/70 bg-neutral-50/80 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-neutral-950">{category.title}</p>
                    <p className="text-sm text-neutral-500">{category.items.length} 条精选记录</p>
                  </div>
                  <span className="text-sm font-medium text-neutral-400">→</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="space-y-6">
          <SectionLabel
            eyebrow="Long-term entries"
            title="长期入口"
            description="这些内容不是一次性的清单，而是我会持续回看的三个方向。"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.title}
                category={category}
                tone={index === 0 ? 'amber' : index === 1 ? 'rose' : 'emerald'}
                lolProfile={category.title === '游戏' ? hobby.lolProfile : undefined}
              />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionLabel
            eyebrow="Monthly digest"
            title="本月更新"
            description="把最近读完的书、看过的电影整理在一起，保留短期兴趣的变化轨迹。"
          />
          <div className="grid gap-6">
            {recentDigest.map((monthData) => (
              <DigestCard key={monthData.month} monthData={monthData} />
            ))}

            {archivedDigest.length ? (
              <details className="group rounded-[2rem] border border-neutral-200/80 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[1.5rem] border border-neutral-200/80 bg-neutral-50/80 px-5 py-4 text-left transition hover:border-neutral-300 hover:bg-white">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                      Earlier months
                    </p>
                    <p className="mt-2 text-base font-semibold text-neutral-950">
                      展开更早月份
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                    <span className="group-open:hidden">查看更多</span>
                    <span className="hidden group-open:inline">收起</span>
                  </span>
                </summary>

                <div className="mt-6 grid gap-6">
                  {archivedDigest.map((monthData) => (
                    <DigestCard key={monthData.month} monthData={monthData} />
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        </section>

        <section className="space-y-6">
          <article className="rounded-[2rem] border border-neutral-200/80 bg-white/80 p-6 shadow-sm backdrop-blur">
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
                  className="group rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-5 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-neutral-950">{entry.label}</p>
                      <p className="mt-2 text-sm leading-7 text-neutral-600">{entry.description}</p>
                    </div>
                    <span className="text-neutral-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
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
    <div className="rounded-2xl border border-neutral-200/80 bg-white/75 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-base font-medium text-neutral-950">{value}</p>
    </div>
  )
}
