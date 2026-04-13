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
  const [mobileSubmenuHref, setMobileSubmenuHref] = useState<string | null>(null)
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
  const activeMobileSubmenuItem = useMemo(
    () => navigationItems.find((item) => item.href === mobileSubmenuHref && item.children?.length) ?? null,
    [mobileSubmenuHref],
  )

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

  const handleMobileNavigate = () => {
    setMobileSubmenuHref(null)
    onNavigate?.()
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

  const renderNavItem = (item: NavItem, index: number) => {
    const hasChildren = !!item.children

    if (!isDesktop && hasChildren) {
      return (
        <li key={item.href} className="site-nav-item site-nav-item--has-dropdown">
          <div className="site-nav-parent-row">
            <Link
              href={item.href}
              onClick={handleMobileNavigate}
              className="site-nav-link site-nav-parent-link"
              data-active={isActive(item.href)}
            >
              <span>{item.label}</span>
            </Link>
            <button
              onClick={() => setMobileSubmenuHref(item.href)}
              className="site-nav-toggle-btn"
              aria-expanded={mobileSubmenuHref === item.href}
              aria-controls={`submenu-${index}`}
              aria-label={`Expand ${item.label} submenu`}
            >
              <svg
                className="site-nav-chevron"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 2.5L7.5 6L4 9.5" />
              </svg>
            </button>
          </div>
        </li>
      )
    }

    return (
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
          <Link
            href={item.href}
            onClick={onNavigate}
            className="site-nav-link"
            data-active={isActive(item.href)}
            aria-haspopup="menu"
            aria-expanded={isPanelOpen && panelHref === item.href}
          >
            <span>{item.label}</span>
          </Link>
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
    )
  }

  return (
    <nav
      className={className}
      aria-label="Primary Navigation"
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleCloseForCrossing}
    >
      {!isDesktop && activeMobileSubmenuItem ? (
        <div className="site-nav-mobile-drawer" id={`submenu-${navigationItems.findIndex((item) => item.href === activeMobileSubmenuItem.href)}`}>
          <div className="site-nav-mobile-drawer-head">
            <button
              type="button"
              className="site-nav-mobile-drawer-back"
              onClick={() => setMobileSubmenuHref(null)}
              aria-label="Back to main menu"
            >
              返回
            </button>
            <p className="site-nav-mobile-drawer-title">{activeMobileSubmenuItem.label}</p>
          </div>
          <div className="site-nav-mobile-drawer-body">
            <Link
              href={activeMobileSubmenuItem.href}
              onClick={handleMobileNavigate}
              className="site-nav-mobile-drawer-link site-nav-mobile-drawer-link--primary"
            >
              查看全部 {activeMobileSubmenuItem.label}
            </Link>
            {activeMobileSubmenuItem.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={handleMobileNavigate}
                className="site-nav-mobile-drawer-link"
              >
                {child.title ?? child.label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <ul className="site-nav-list">
          {navigationItems.map((item, index) => renderNavItem(item, index))}
        </ul>
      )}

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
