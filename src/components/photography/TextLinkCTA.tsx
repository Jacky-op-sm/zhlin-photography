import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

interface TextLinkCTAProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: ReactNode
}

export default function TextLinkCTA({
  className = '',
  href,
  children,
  ...props
}: TextLinkCTAProps) {
  return (
    <Link href={href} className={`text-link-cta group ${className}`.trim()} {...props}>
      <span>{children}</span>
      <svg
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M5 12h14m-6-6 6 6-6 6"
        />
      </svg>
    </Link>
  )
}
