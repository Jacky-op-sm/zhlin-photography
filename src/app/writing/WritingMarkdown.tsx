import Markdown, { type ExtraProps } from 'react-markdown'
import type { ComponentProps } from 'react'
import WritingFigure from './WritingFigure'
import WritingImageStack from './WritingImageStack'

function ArticleImage({ src, alt }: ComponentProps<'img'>) {
  // Native images preserve each authored photograph's intrinsic aspect ratio.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt ?? ''} loading="lazy" decoding="async" />
}

function ArticleParagraph({ node, children }: ComponentProps<'p'> & ExtraProps) {
  const content = node?.children.filter(child => child.type !== 'text' || child.value.trim())
  // Consecutive image lines in one Markdown paragraph form an authored stack.
  // A blank line still separates independent figures, as it does in Markdown.
  if (content && content.length > 1 && content.every(child =>
    child.type === 'element' && child.tagName === 'img' && typeof child.properties.src === 'string' && child.properties.src,
  )) {
    const images = content.flatMap(child => {
      if (child.type !== 'element' || typeof child.properties.src !== 'string') return []
      const { src, alt, title } = child.properties
      return [{
        src,
        alt: typeof alt === 'string' ? alt : '',
        caption: typeof title === 'string' ? title : undefined,
      }]
    })
    return <WritingImageStack images={images} />
  }
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
