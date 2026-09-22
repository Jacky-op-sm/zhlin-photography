import Link from 'next/link'
import type { WritingMetadata } from '@/lib/content/writing-model'

const months = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']

export default function ArchiveList({ entries, currentSlug, onOpen }: {
  entries: WritingMetadata[]
  currentSlug?: string
  onOpen?: (slug: string) => void
}) {
  const groups = new Map<string, WritingMetadata[]>()
  for (const entry of entries) {
    const month = entry.date?.slice(0, 7) ?? 'unknown'
    groups.set(month, [...(groups.get(month) ?? []), entry])
  }
  const Heading = currentSlug ? 'h2' : 'h1'
  const MonthHeading = currentSlug ? 'h3' : 'h2'
  const grouped = [...groups]
  return <div className="writing-archive">
    {grouped.map(([month, items], index) => {
      const undated = month === 'unknown'
      const year = undated ? '' : month.slice(0, 4)
      const monthName = undated ? '日期未注明' : `${months[Number(month.slice(5)) - 1]}月`
      const label = undated ? monthName : `${year}年${monthName}`
      const showYear = year !== grouped[index - 1]?.[0].slice(0, 4)
      return <section className="writing-month" key={month} aria-label={label} data-month={month}>
        {index === 0
          ? <Heading className="writing-archive-title">{undated ? monthName : `${year}年 · ${monthName}`}</Heading>
          : <MonthHeading className="writing-month-heading"><span>{showYear ? year : ''}</span><span>{monthName}</span></MonthHeading>}
        <ul>{items.map(entry => <li key={entry.slug}>
          <Link prefetch={false} href={`/writing/${entry.slug}`} onClick={onOpen ? () => onOpen(entry.slug) : undefined} aria-current={entry.slug === currentSlug ? 'page' : undefined} className="writing-entry">
            <span className="writing-entry-title" lang={entry.lang}>{entry.title}</span>
            <span className="writing-leader" aria-hidden="true" />
            {entry.date?.length === 10
              ? <time dateTime={entry.date} aria-label={`原档日期 ${entry.date}`}>{Number(entry.date.slice(8))}日</time>
              : <span className="writing-undated" aria-label={entry.date ? '原稿只确定到月份，具体日期未注明' : '日期未注明'}>—</span>}
          </Link>
        </li>)}</ul>
      </section>
    })}
  </div>
}
