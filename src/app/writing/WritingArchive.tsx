'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { archiveUrl, defaultFilters, filterWriting, normalizeFilters, writingPeriods, type WritingMetadata } from '@/lib/content/writing-model'
import ArchiveList from './ArchiveList'

const event = 'writing-url-change'
function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback)
  window.addEventListener(event, callback)
  return () => { window.removeEventListener('popstate', callback); window.removeEventListener(event, callback) }
}
const snapshot = () => window.location.search
const serverSnapshot = () => ''

export default function WritingArchive({ entries }: { entries: WritingMetadata[] }) {
  const search = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const periods = writingPeriods(entries)
  const years = [...new Set(periods.map(period => period.slice(0, 4)))]
  const months = [...new Set(periods.map(period => period.slice(5)))].sort()
  const filters = normalizeFilters(new URLSearchParams(search), periods)
  const url = archiveUrl(filters)
  const results = filterWriting(entries, filters)
  useEffect(() => {
    const canonical = archiveUrl(normalizeFilters(new URLSearchParams(window.location.search), writingPeriods(entries)))
    if (`/writing${window.location.search}` !== canonical) {
      window.history.replaceState(null, '', canonical)
      window.dispatchEvent(new Event(event))
    }
  }, [url, entries])
  function change(key: string, value: string) {
    const next = key === 'reset' ? '/writing' : archiveUrl({ ...filters, [key]: value })
    window.history.pushState(null, '', next)
    window.dispatchEvent(new Event(event))
  }
  function remember(slug: string) {
    try { sessionStorage.setItem(`writing-return:${slug}`, url) } catch { /* Storage is optional. */ }
  }
  const isDefault = Object.keys(defaultFilters).every(key => filters[key as keyof typeof filters] === defaultFilters[key as keyof typeof filters])
  return <>
    {results.length === 0 ? <><h1 className="writing-archive-title">文字</h1><p className="writing-empty">没有符合条件的文章。</p></> : <ArchiveList entries={results} onOpen={remember} />}
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">共 {results.length} 篇</p>
    <details className="writing-filter-disclosure" open={!isDefault || undefined}>
    <summary>筛选文字</summary>
    <div className="writing-toolbar" aria-label="文字筛选">
      <div className="writing-filter-pair">
        <div><label className="sr-only" htmlFor="writing-year">年份</label><select id="writing-year" value={filters.year} onChange={e => change('year', e.target.value)}><option value="all">全部年份</option>{years.map(year => <option key={year} value={year}>{year}年</option>)}</select></div>
        <div><label className="sr-only" htmlFor="writing-month">月份</label><select id="writing-month" value={filters.month} onChange={e => change('month', e.target.value)}><option value="all">全部月份</option>{months.map(month => <option key={month} value={month}>{Number(month)}月</option>)}</select></div>
      </div>
      <div className="writing-sort"><label className="sr-only" htmlFor="writing-sort">排序</label><select id="writing-sort" value={filters.sort} onChange={e => change('sort', e.target.value)}><option value="newest">从新到旧</option><option value="oldest">从旧到新</option></select></div>
    </div>
    <div className="writing-result"><p aria-hidden="true">共 {results.length} 篇</p>{!isDefault && <button onClick={() => change('reset', '')}>清除筛选</button>}</div>
    </details>
  </>
}
