'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export default function SiteFrame({ children, header, footer }: {
  children: ReactNode
  header: ReactNode
  footer: ReactNode
}) {
  const pathname = usePathname()
  const isExhibition = pathname === '/photography' || pathname.startsWith('/photography/')

  return (
    <div id="site-root">
      {!isExhibition && header}
      <div id="main-content" className={isExhibition ? undefined : 'site-main'} tabIndex={-1}>
        {children}
      </div>
      {!isExhibition && footer}
    </div>
  )
}
