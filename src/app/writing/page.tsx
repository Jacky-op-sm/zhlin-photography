import { buildPageMetadata } from '@/lib/site/metadata'
import { getWritingMetadata } from '@/lib/content/writing'
import { featuredWritingSlugs } from '@/lib/content/writing-featured'
import { defaultFilters, filterWriting } from '@/lib/content/writing-model'
import ArchiveList from './ArchiveList'

export const metadata = buildPageMetadata({ title: '文字', description: '按原稿年份与月份整理的生活、旅行与阅读随笔。', path: '/writing' })

export default function WritingPage() {
  const entries = getWritingMetadata()
  const featured = featuredWritingSlugs.map(slug => {
    const entry = entries.find(item => item.slug === slug)
    if (!entry) throw new Error(`Missing featured writing: ${slug}`)
    return entry
  })
  const featuredSlugs = new Set<string>(featuredWritingSlugs)
  const archive = filterWriting(entries.filter(entry => !featuredSlugs.has(entry.slug)), defaultFilters)
  return <ArchiveList entries={archive} featured={featured} />
}
