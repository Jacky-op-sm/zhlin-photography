'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

interface NavigationProps {
  className?: string
  onNavigate?: () => void
  onDropdownOpenChange?: (open: boolean) => void
  mode?: 'desktop' | 'mobile'
}

interface NavItem {
  label: string
  href: string
  children?: { label: string; href: string; title?: string }[]
}

const navigationItems: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Photography',
    href: '/photography',
    children: [
      { label: 'Pets', title: '宠物摄影', href: '/photography/pets' },
      { label: 'Street', title: '街头摄影', href: '/photography/street' },
      { label: 'Project', title: '项目摄影', href: '/photography/project' },
    ],
  },
  {
    label: 'Travel',
    href: '/travel',
    children: [
      { label: 'Hangzhou', title: '杭州', href: '/travel/hangzhou' },
      { label: 'Nanjing', title: '南京', href: '/travel/nanjing' },
      { label: 'Japan', title: '日本', href: '/travel/japan' },
      { label: 'Shanghai', title: '上海', href: '/travel/shanghai' },
      { label: 'Dongbei', title: '东北', href: '/travel/dongbei' },
      { label: 'Beijing', title: '北京', href: '/travel/beijing' },
    ],
  },
  { label: 'Hobby', href: '/hobby' },
  { label: 'Contact', href: '/contact' },
]

export default function Navigation({
  className = '',
  onNavigate,
  onDropdownOpenChange,
  mode = 'desktop',
}: NavigationProps) {
  const NAV_TO_PANEL_GRACE_MS = 140
  const pathname = usePathname()
  const [panelHref, setPanelHref] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDesktop = mode === 'desktop'
  const fallbackDropdownItem = useMemo(
    () => navigationItems.find((item) => item.children?.length),
    [],
  )
  const activeDropdownItem = useMemo(
    () => navigationItems.find((item) => item.href === panelHref && item.children?.length),
    [panelHref],
  )
  const displayDropdownItem = activeDropdownItem ?? fallbackDropdownItem

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const setDropdownOpen = (href: string | null) => {
    if (!isDesktop) return
    clearCloseTimer()
    if (!href) {
      setIsPanelOpen(false)
      return
    }
    if (panelHref !== href) {
      setPanelHref(href)
    }
    setIsPanelOpen(true)
  }

  const scheduleCloseForCrossing = () => {
    if (!isDesktop) return
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setDropdownOpen(null)
    }, NAV_TO_PANEL_GRACE_MS)
  }

  useEffect(() => {
    if (!isDesktop) return
    onDropdownOpenChange?.(isPanelOpen)
  }, [isDesktop, isPanelOpen, onDropdownOpenChange])

  useEffect(() => {
    return () => {
      clearCloseTimer()
      onDropdownOpenChange?.(false)
    }
  }, [onDropdownOpenChange])

  return (
    <nav
      className={className}
      aria-label="Primary Navigation"
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleCloseForCrossing}
    >
      <ul className="site-nav-list">
        {navigationItems.map((item) => (
          <li
            key={item.href}
            className={`site-nav-item ${item.children ? 'site-nav-item--has-dropdown' : ''}`}
            onMouseEnter={() => setDropdownOpen(item.children ? item.href : null)}
            onFocusCapture={() => setDropdownOpen(item.children ? item.href : null)}
            onBlurCapture={(event) => {
              const nextTarget = event.relatedTarget as Node | null
              if (!event.currentTarget.contains(nextTarget)) {
                scheduleCloseForCrossing()
              }
            }}
          >
            {item.children ? (
              <>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className="site-nav-link"
                  data-active={isActive(item.href)}
                  aria-haspopup="menu"
                  aria-expanded={isDesktop ? isPanelOpen && panelHref === item.href : true}
                >
                  <span>{item.label}</span>
                </Link>

                {!isDesktop ? (
                  <div className="site-nav-dropdown-shell" data-open="true">
                    <div className="site-nav-dropdown" role="menu">
                      <div className="site-nav-dropdown-inner">
                        <section className="site-nav-dropdown-column">
                          <p className="site-nav-dropdown-overline">主题分类</p>
                          <div className="site-nav-dropdown-links">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onNavigate}
                                className="site-nav-dropdown-link"
                              >
                                {child.title ?? child.label}
                              </Link>
                            ))}
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                ) : null}
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

      {isDesktop && displayDropdownItem ? (
        <div
          className="site-nav-dropdown-shell"
          data-open={isPanelOpen ? 'true' : 'false'}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={() => setDropdownOpen(null)}
        >
          <div className="site-nav-dropdown" role="menu">
            <div className="site-shell site-nav-dropdown-inner">
              <section className="site-nav-dropdown-column">
                <p className="site-nav-dropdown-overline">主题分类</p>
                <div className="site-nav-dropdown-links">
                  {displayDropdownItem.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className="site-nav-dropdown-link"
                    >
                      {child.title ?? child.label}
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  )
}

export { navigationItems }
export type { NavItem }
