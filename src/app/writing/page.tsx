import { buildPageMetadata } from '@/lib/site/metadata'
import { getWritingArchiveSections } from '@/lib/content/writing'
import ArchiveList from './ArchiveList'

export const metadata = buildPageMetadata({ title: '文字', description: '按原稿年份与月份整理的生活、旅行与阅读随笔。', path: '/writing' })

export default function WritingPage() {
  const { featured, archive } = getWritingArchiveSections()
  return <ArchiveList entries={archive} featured={featured} />
}
