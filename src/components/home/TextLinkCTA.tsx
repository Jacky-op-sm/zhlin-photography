import Link from 'next/link'
import clsx from 'clsx'

type TextLinkCTAProps = {
  children?: React.ReactNode
  href?: string
  className?: string
}

const baseClassName =
  'text-link-cta group inline-flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--portfolio-text)]'

export default function TextLinkCTA({
  children = 'See more',
  href,
  className,
}: TextLinkCTAProps) {
  if (href) {
    return (
      <Link href={href} className={clsx(baseClassName, className)}>
        <span>{children}</span>
        <span aria-hidden className="h-px w-8 bg-current transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    )
  }

  return (
    <span className={clsx(baseClassName, className)}>
      <span>{children}</span>
      <span aria-hidden className="h-px w-8 bg-current transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  )
}
