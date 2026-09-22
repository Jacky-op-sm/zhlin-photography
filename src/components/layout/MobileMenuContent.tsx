'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { NavigationItem } from '@/lib/site/types'

interface MobileMenuContentProps {
  items: NavigationItem[]
  className?: string
  onNavigate: () => void
  onClose: () => void
}

export default function MobileMenuContent({
  items,
  className = '',
  onNavigate,
  onClose,
}: MobileMenuContentProps) {
  const pathname = usePathname()
  const [submenuHref, setSubmenuHref] = useState<string | null>(null)
  const submenu = useMemo(
    () =>
      items.find((item) => item.href === submenuHref && item.children?.length) ??
      null,
    [items, submenuHref],
  )
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className={className} aria-label="主导航">
      <div className="site-nav-mobile-stack">
        <div className="site-nav-mobile-head">
          {submenu ? (
            <button
              type="button"
              className="site-nav-mobile-head-action"
              onClick={() => setSubmenuHref(null)}
              aria-label="返回主菜单"
            >
              <span aria-hidden="true">←</span>
            </button>
          ) : (
            <span className="site-nav-mobile-head-spacer" aria-hidden="true" />
          )}
          <button
            type="button"
            className="site-nav-mobile-head-action"
            onClick={onClose}
            aria-label="关闭菜单"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div
          className={`site-nav-mobile-stage ${submenu ? 'is-submenu' : ''}`}
        >
          <section className="site-nav-mobile-screen">
            <ul className="site-nav-list">
              {items.map((item, index) => {
                const hasChildren = !!item.children?.length
                return hasChildren ? (
                  <li
                    key={item.href}
                    className="site-nav-item site-nav-item--has-dropdown"
                  >
                    <button
                      type="button"
                      onClick={() => setSubmenuHref(item.href)}
                      className="site-nav-link site-nav-parent-link"
                      aria-expanded={submenuHref === item.href}
                      aria-controls={`submenu-${index}`}
                      aria-label={`展开 ${item.label} 子菜单`}
                    >
                      <span>{item.label}</span>
                    </button>
                  </li>
                ) : (
                  <li key={item.href} className="site-nav-item ">
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="site-nav-link"
                      data-active={isActive(item.href)}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
          <section className="site-nav-mobile-screen">
            {submenu ? (
              <div
                className="site-nav-mobile-submenu-screen"
                id={`submenu-${items.findIndex((item) => item.href === submenu.href)}`}
              >
                {submenu.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    prefetch={false}
                    onClick={onNavigate}
                    className="site-nav-mobile-submenu-link"
                  >
                    {child.title ?? child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <div
                className="site-nav-mobile-submenu-screen"
                aria-hidden="true"
              />
            )}
          </section>
        </div>
      </div>
    </nav>
  )
}
