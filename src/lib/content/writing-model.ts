import type { z } from 'zod'
import type { writingSchema } from './writing-schema'

export type WritingEntry = z.infer<typeof writingSchema>
export type WritingMetadata = Omit<WritingEntry, 'body' | 'status'>
export type WritingFilters = { year: string; month: string; sort: 'newest' | 'oldest' }
export const defaultFilters: WritingFilters = { year: 'all', month: 'all', sort: 'newest' }

export function writingPeriods(entries: WritingMetadata[]) {
  return [...new Set(entries.flatMap(entry => entry.date ? [entry.date.slice(0, 7)] : []))].sort().reverse()
}

export function normalizeFilters(params: Pick<URLSearchParams, 'get'>, periods: string[]): WritingFilters {
  const year = params.get('year') ?? ''
  const month = params.get('month') ?? ''
  return {
    year: periods.some(period => period.slice(0, 4) === year) ? year : 'all',
    month: periods.some(period => period.slice(5) === month) ? month : 'all',
    sort: params.get('sort') === 'oldest' ? 'oldest' : 'newest',
  }
}

export function archiveUrl(filters: WritingFilters) {
  const params = new URLSearchParams()
  if (filters.year !== 'all') params.set('year', filters.year)
  if (filters.month !== 'all') params.set('month', filters.month)
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  return `/writing${params.size ? `?${params}` : ''}`
}

export function filterWriting(entries: WritingMetadata[], filters: WritingFilters) {
  return entries.filter(entry =>
    (filters.year === 'all' || entry.date?.slice(0, 4) === filters.year) &&
    (filters.month === 'all' || entry.date?.slice(5, 7) === filters.month),
  ).sort((a, b) => {
    if (!a.date && b.date) return 1
    if (a.date && !b.date) return -1
    const direction = filters.sort === 'oldest' ? 1 : -1
    const monthOrder = (a.date?.slice(0, 7) ?? '').localeCompare(b.date?.slice(0, 7) ?? '')
    if (monthOrder) return direction * monthOrder
    // Month-only entries stay after known days within their own month in both orders.
    const aDay = a.date?.slice(8) ?? ''
    const bDay = b.date?.slice(8) ?? ''
    if (!aDay && bDay) return 1
    if (aDay && !bDay) return -1
    return direction * aDay.localeCompare(bDay) || (a.order ?? 0) - (b.order ?? 0) || a.slug.localeCompare(b.slug)
  })
}
