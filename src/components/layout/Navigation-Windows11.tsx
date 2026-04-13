'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  className?: string
  onNavigate?: () => void
}

interface NavItem {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

const navigationItems: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Photography',
    href: '/photography',
    children: [
      { label: 'Pets', href: '/photography/pets' },
      { label: 'Street', href: '/photography/street' },
      { label: 'Project', href: '/photography/project' },
    ],
  },
  { label: 'Travel', href: '/travel' },
  { label: 'Hobby', href: '/hobby' },
  { label: 'Contact', href: '/contact' },
]

export default function Navigation({ className = '', onNavigate }: NavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className={className} aria-label="Primary Navigation">
      <ul className="site-nav-list">
        {navigationItems.map((item) => (
          <li key={item.href} className="site-nav-item group">
            {item.children ? (
              <>
                <button className="site-nav-link" data-active={isActive(item.href)} aria-haspopup="menu">
                  <span>{item.label}</span>
                  <svg className="site-nav-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="site-nav-dropdown-shell">
                  <div className="site-nav-dropdown" role="menu">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        className="site-nav-dropdown-link"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <Link
                href={item.href}
                onClick={onNavigate}
                className="site-nav-link"
                data-active={isActive(item.href)}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { navigationItems }
export type { NavItem }
