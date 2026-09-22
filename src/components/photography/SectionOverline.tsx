import type { HTMLAttributes } from 'react'

type SectionOverlineProps = HTMLAttributes<HTMLParagraphElement>

export default function SectionOverline({
  className = '',
  children,
  ...props
}: SectionOverlineProps) {
  return (
    <p className={`photography-overline ${className}`.trim()} {...props}>
      {children}
    </p>
  )
}
