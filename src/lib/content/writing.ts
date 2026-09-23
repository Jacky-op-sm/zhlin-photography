import 'server-only'
import data from '../../../.generated/writing.json'
import { featuredWritingSlugs } from './writing-featured'
import { defaultFilters, filterWriting } from './writing-model'
import type { WritingEntry, WritingMetadata } from './writing-model'

export function getWritingEntries(): WritingEntry[] {
  return data.entries as WritingEntry[]
}

export function getWritingMetadata(): WritingMetadata[] {
  return getWritingEntries().map(({ slug, title, date, type, lang, order }) => ({ slug, title, date, type, lang, order }))
}

export function getWritingEntry(slug: string) {
  return getWritingEntries().find(entry => entry.slug === slug)
}

export function getLatestWritingMetadata(): WritingMetadata | undefined {
  return filterWriting(getWritingMetadata(), defaultFilters)[0]
}

export function getWritingArchiveSections() {
  const entries = getWritingMetadata()
  const featured = featuredWritingSlugs.map(slug => {
    const entry = entries.find(item => item.slug === slug)
    if (!entry) throw new Error(`Missing featured writing: ${slug}`)
    return entry
  }).sort((a, b) => [...a.title].length - [...b.title].length)
  const featuredSlugs = new Set<string>(featuredWritingSlugs)
  const archive = filterWriting(entries.filter(entry => !featuredSlugs.has(entry.slug)), defaultFilters)
  return { featured, archive }
}

export function getHobbyWritingSlug(source: string): string | undefined {
  return (data.hobbyLinks as Record<string, string>)[source]
}
