import 'server-only'
import data from '../../../.generated/writing.json'
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

export function getHobbyWritingSlug(source: string): string | undefined {
  return (data.hobbyLinks as Record<string, string>)[source]
}
