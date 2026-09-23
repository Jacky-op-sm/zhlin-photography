import { notFound } from 'next/navigation'
import { getWritingEntry, getWritingMetadata } from '@/lib/content/writing'
import { writingTypeLabels } from '@/lib/content/writing-model'
import { buildPageMetadata } from '@/lib/site/metadata'
import ReturnLink from '../ReturnLink'
import WritingMarkdown from '../WritingMarkdown'

export const dynamicParams = false
export function generateStaticParams() { return getWritingMetadata().map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const entry = getWritingEntry((await params).slug)
  if (!entry) notFound()
  return buildPageMetadata({ title: entry.title, description: `${entry.title} · ${writingTypeLabels[entry.type]} · 文字`, path: `/writing/${entry.slug}` })
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = getWritingEntry((await params).slug)
  if (!entry) notFound()
  return <>
    <article lang={entry.lang}>
      <header className="writing-article-heading"><h1>{entry.title}</h1><p className="sr-only">{entry.date ? <time dateTime={entry.date}>原档日期 {entry.date.replaceAll('-', '.')}</time> : '日期未注明'}<span aria-hidden="true"> · </span>{writingTypeLabels[entry.type]}</p></header>
      <div className="writing-prose"><WritingMarkdown>{entry.body}</WritingMarkdown></div>
    </article>
    <nav className="writing-postscript" aria-label="返回文字"><ReturnLink /></nav>
  </>
}
