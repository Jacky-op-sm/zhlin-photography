import Link from 'next/link'
import type { WritingMetadata } from '@/lib/content/writing-model'

const months = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']

function archiveKey(entry: WritingMetadata) {
  if (!entry.date) return 'unknown'
  return entry.date.startsWith('2026-') ? entry.date.slice(0, 7) : entry.date.slice(0, 4)
}

function rowDate(entry: WritingMetadata, fullDate = false) {
  if (!entry.date) return <span className="writing-undated" aria-label="日期未注明">—</span>

  const year = Number(entry.date.slice(0, 4))
  const month = Number(entry.date.slice(5, 7))
  const day = entry.date.length === 10 ? `${Number(entry.date.slice(8))}日` : ''
  const label = fullDate ? `${year}年${month}月${day}` : entry.date.startsWith('2026-') ? day || '—' : `${month}月${day}`
  if (!day) return <span className="writing-undated" aria-label={`原稿只确定到 ${entry.date.slice(0, 7)}`}>{label}</span>
  return <time dateTime={entry.date} aria-label={`原档日期 ${entry.date}`}>{label}</time>
}

function WritingRows({ entries, fullDate = false }: { entries: WritingMetadata[]; fullDate?: boolean }) {
  return <ul>{entries.map(entry => <li key={entry.slug}>
    <Link prefetch={false} href={`/writing/${entry.slug}`} className="writing-entry">
      <span className="writing-entry-title" lang={entry.lang}>{entry.title}</span>
      <span className="writing-leader" aria-hidden="true" />
      {rowDate(entry, fullDate)}
    </Link>
  </li>)}</ul>
}

export default function ArchiveList({ entries, featured }: {
  entries: WritingMetadata[]
  featured?: WritingMetadata[]
}) {
  const groups = new Map<string, WritingMetadata[]>()
  for (const entry of entries) {
    const key = archiveKey(entry)
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }
  const grouped = [...groups]
  let displayedYear = ''

  return <div className="writing-archive">
    {featured && <section className="writing-month writing-featured" aria-label="精选">
      <h1 className="writing-archive-title">精选</h1>
      <WritingRows entries={featured} fullDate />
    </section>}
    {grouped.map(([key, items]) => {
      const undated = key === 'unknown'
      const year = undated ? '' : key.slice(0, 4)
      const byMonth = key.length === 7
      const monthName = byMonth ? `${months[Number(key.slice(5)) - 1]}月` : ''
      const label = undated ? '日期未注明' : byMonth ? `${year}年${monthName}` : `${year}年`
      const showYear = year !== displayedYear
      displayedYear = year

      return <section className="writing-month" key={key} aria-label={label} data-month={byMonth ? key : undefined} data-year={!byMonth && !undated ? year : undefined}>
        <h2 className="writing-month-heading"><span>{undated ? label : showYear ? year : ''}</span><span>{byMonth ? monthName : ''}</span></h2>
        <WritingRows entries={items} />
      </section>
    })}
  </div>
}
