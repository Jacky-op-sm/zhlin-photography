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
      <ul className="flex items-center space-x-1">
        {navigationItems.map((item) => (
          <li key={item.href} className="relative group">
            {item.children ? (
              <>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  {item.label}
                  <svg
                    className="ml-1 w-4 h-4"
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
                <div className="absolute left-0 mt-1 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
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
