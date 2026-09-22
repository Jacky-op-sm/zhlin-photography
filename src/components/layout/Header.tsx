import Link from 'next/link'
import DesktopNavigation from '@/components/layout/DesktopNavigation'
import MobileNavigation from '@/components/layout/MobileNavigation'
import { getHeaderNavigation } from '@/lib/site/content'

export default function Header() {
  const navigation = getHeaderNavigation()

  return (
    <header className="site-header">
      <div className="site-shell site-header-inner">
        <Link href="/" className="site-brand" aria-label="返回首页">
          <span className="site-brand-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7.5h3l1.4-2h7.2l1.4 2h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          </span>
          <span className="site-brand-mark">ZH</span>
          <span className="site-brand-name">Photography</span>
        </Link>

        <DesktopNavigation
          items={navigation}
          className="site-nav-desktop hidden md:block"
        />
        <MobileNavigation items={navigation} />
      </div>
    </header>
  )
}
