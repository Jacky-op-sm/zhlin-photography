import type { ReactNode } from 'react'

export default function WritingFigure({ children, caption }: { children: ReactNode; caption?: string }) {
  return <figure className="writing-figure">
    <div className="writing-figure-mat">{children}</div>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>
}
