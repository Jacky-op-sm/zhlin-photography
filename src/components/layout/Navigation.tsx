'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  className?: string
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
      { label: 'Street', href: '/photography/street' },
      { label: 'Pets', href: '/photography/pets' },
      { label: 'Project', href: '/photography/project' },
    ],
  },
  { label: 'Travel', href: '/travel' },
  { label: 'Hobby', href: '/hobby' },
  { label: 'Contact', href: '/contact' },
]

export default function Navigation({ className = '' }: NavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className={className}>
      <ul className="flex items-center gap-7">
        {navigationItems.map((item) => (
          <li key={item.href} className="relative group">
            {item.children ? (
              <>
                <button
                  className="site-nav-link"
                  data-active={isActive(item.href)}
                  aria-haspopup="menu"
                >
                  {item.label}
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="invisible absolute left-0 z-50 mt-3 w-44 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="site-nav-dropdown py-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--portfolio-muted)] transition hover:text-[color:var(--portfolio-text)]"
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
