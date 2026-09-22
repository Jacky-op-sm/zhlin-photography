import Markdown, { type ExtraProps } from 'react-markdown'
import type { ComponentProps } from 'react'
import WritingFigure from './WritingFigure'

function ArticleImage({ src, alt }: ComponentProps<'img'>) {
  // Native images preserve each authored photograph's intrinsic aspect ratio.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt ?? ''} loading="lazy" decoding="async" />
}

function ArticleParagraph({ node, children }: ComponentProps<'p'> & ExtraProps) {
  const content = node?.children.filter(child => child.type !== 'text' || child.value.trim())
  const child = content?.length === 1 ? content[0] : undefined
  const image = child?.type === 'element' && child.tagName === 'img' ? child
    : child?.type === 'element' && child.tagName === 'a' && child.children.length === 1
      && child.children[0].type === 'element' && child.children[0].tagName === 'img' ? child.children[0] : undefined

  // Replace the paragraph itself: a figure inside a <p> would be invalid HTML.
  if (image) return <WritingFigure caption={typeof image.properties.title === 'string' ? image.properties.title : undefined}>{children}</WritingFigure>
  return <p>{children}</p>
}

export default function WritingMarkdown({ children }: { children: string }) {
  return <Markdown skipHtml components={{ h1: ({ children }) => <h2>{children}</h2>, p: ArticleParagraph, img: ArticleImage }}>{children}</Markdown>
}
