import Link from 'next/link'
import type { WritingMetadata } from '@/lib/content/writing-model'

const months = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']

function archiveKey(entry: WritingMetadata) {
  if (!entry.date) return 'unknown'
  return entry.date.startsWith('2026-') ? entry.date.slice(0, 7) : entry.date.slice(0, 4)
}

function rowDate(entry: WritingMetadata) {
  if (!entry.date) return <span className="writing-undated" aria-label="日期未注明">—</span>

  const month = Number(entry.date.slice(5, 7))
  const day = entry.date.length === 10 ? `${Number(entry.date.slice(8))}日` : ''
  const label = entry.date.startsWith('2026-') ? day || '—' : `${month}月${day}`
  if (!day) return <span className="writing-undated" aria-label={`原稿只确定到 ${entry.date.slice(0, 7)}`}>{label}</span>
  return <time dateTime={entry.date} aria-label={`原档日期 ${entry.date}`}>{label}</time>
}

export default function ArchiveList({ entries, currentSlug, onOpen }: {
  entries: WritingMetadata[]
  currentSlug?: string
  onOpen?: (slug: string) => void
}) {
  const groups = new Map<string, WritingMetadata[]>()
  for (const entry of entries) {
    const key = archiveKey(entry)
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }
  const Heading = currentSlug ? 'h2' : 'h1'
  const SectionHeading = currentSlug ? 'h3' : 'h2'
  const grouped = [...groups]
  let displayedYear = ''

  return <div className="writing-archive">
    {grouped.map(([key, items], index) => {
      const undated = key === 'unknown'
      const year = undated ? '' : key.slice(0, 4)
      const byMonth = key.length === 7
      const monthName = byMonth ? `${months[Number(key.slice(5)) - 1]}月` : ''
      const label = undated ? '日期未注明' : byMonth ? `${year}年${monthName}` : `${year}年`
      const isLatestMonth = index === 0 && byMonth
      const showYear = year !== displayedYear
      if (!isLatestMonth) displayedYear = year

      return <section className="writing-month" key={key} aria-label={label} data-month={byMonth ? key : undefined} data-year={!byMonth && !undated ? year : undefined}>
        {isLatestMonth
          ? <Heading className="writing-archive-title">{monthName}随想</Heading>
          : <SectionHeading className="writing-month-heading"><span>{undated ? label : showYear ? year : ''}</span><span>{byMonth ? monthName : ''}</span></SectionHeading>}
        <ul>{items.map(entry => <li key={entry.slug}>
          <Link prefetch={false} href={`/writing/${entry.slug}`} onClick={onOpen ? () => onOpen(entry.slug) : undefined} aria-current={entry.slug === currentSlug ? 'page' : undefined} className="writing-entry">
            <span className="writing-entry-title" lang={entry.lang}>{entry.title}</span>
            {entry.type === 'sketch' && <span className="writing-entry-tag">写作练习</span>}
            <span className="writing-leader" aria-hidden="true" />
            {rowDate(entry)}
          </Link>
        </li>)}</ul>
      </section>
    })}
  </div>
}
