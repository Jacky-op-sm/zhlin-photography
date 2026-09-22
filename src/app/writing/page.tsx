import { buildPageMetadata } from '@/lib/site/metadata'
import { getWritingMetadata } from '@/lib/content/writing'
import WritingArchive from './WritingArchive'

export const metadata = buildPageMetadata({ title: '文字', description: '按原稿年份与月份整理的生活、旅行与阅读随笔。', path: '/writing' })

export default function WritingPage() {
  return <><noscript><p className="writing-notice">以下为全部文字；启用 JavaScript 后可按年份、月份和顺序筛选。</p></noscript><WritingArchive entries={getWritingMetadata()} /></>
}
