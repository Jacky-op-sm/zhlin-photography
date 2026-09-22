'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { NavigationItem } from '@/lib/site/types'

const NAV_TO_PANEL_GRACE_MS = 140

interface DesktopNavigationProps {
  items: NavigationItem[]
  className?: string
  onNavigate?: () => void
}

export default function DesktopNavigation({
  items,
  className = '',
  onNavigate,
}: DesktopNavigationProps) {
  const pathname = usePathname()
  const [panelHref, setPanelHref] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handledTouchParentHrefRef = useRef<string | null>(null)
  const navRootRef = useRef<HTMLElement | null>(null)
  const dropdownShellRef = useRef<HTMLDivElement | null>(null)

  const fallbackDropdownItem = useMemo(
    () => items.find((item) => item.children?.length),
    [items],
  )
  const activeDropdownItem = useMemo(
    () => items.find((item) => item.href === panelHref && item.children?.length),
    [items, panelHref],
  )
  const displayDropdownItem = activeDropdownItem ?? fallbackDropdownItem

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const setDropdownOpen = (href: string | null) => {
    clearCloseTimer()
    if (!href) {
      setIsPanelOpen(false)
      return
    }
    if (panelHref !== href) setPanelHref(href)
    setIsPanelOpen(true)
  }

  const scheduleCloseForCrossing = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setDropdownOpen(null)
    }, NAV_TO_PANEL_GRACE_MS)
  }

  const handleParentClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (handledTouchParentHrefRef.current === href) {
      handledTouchParentHrefRef.current = null
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (!isCoarsePointer && navigator.maxTouchPoints === 0) {
      onNavigate?.()
      return
    }
    event.preventDefault()
    event.stopPropagation()
    setDropdownOpen(isPanelOpen && panelHref === href ? null : href)
  }

  const handleParentPointerDown = (
    event: ReactPointerEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const useTouchDropdown =
      event.pointerType === 'touch' ||
      isCoarsePointer ||
      navigator.maxTouchPoints > 0
    if (!useTouchDropdown) return
    event.preventDefault()
    event.stopPropagation()
    handledTouchParentHrefRef.current = href
    setDropdownOpen(isPanelOpen && panelHref === href ? null : href)
  }

  useEffect(() => {
    const coarsePointerQuery = window.matchMedia(
      '(hover: none) and (pointer: coarse)',
    )
    const updatePointerMode = () => {
      setIsCoarsePointer(
        coarsePointerQuery.matches || navigator.maxTouchPoints > 0,
      )
    }

    updatePointerMode()
    coarsePointerQuery.addEventListener('change', updatePointerMode)
    return () => coarsePointerQuery.removeEventListener('change', updatePointerMode)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('site-nav-overlay-open', isPanelOpen)
    return () => document.body.classList.remove('site-nav-overlay-open')
  }, [isPanelOpen])

  useEffect(() => {
    if (!isPanelOpen) return

    const handleOutsidePointer = (event: PointerEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (navRootRef.current?.contains(target)) return
      if (dropdownShellRef.current?.contains(target)) return
      setIsPanelOpen(false)
    }

    document.addEventListener('pointerdown', handleOutsidePointer, true)
    document.addEventListener('touchstart', handleOutsidePointer, true)
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer, true)
      document.removeEventListener('touchstart', handleOutsidePointer, true)
    }
  }, [isPanelOpen])

  useEffect(() => {
    if (!isPanelOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearCloseTimer()
        setIsPanelOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isPanelOpen])

  useEffect(() => () => clearCloseTimer(), [])

  return (
    <nav
      ref={navRootRef}
      className={className}
      aria-label="主导航"
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleCloseForCrossing}
    >
      <ul className="site-nav-list">
        {items.map((item) => {
          const hasChildren = !!item.children?.length
          return (
            <li
              key={item.href}
              className={`site-nav-item ${hasChildren ? 'site-nav-item--has-dropdown' : ''}`}
              onMouseEnter={() => setDropdownOpen(hasChildren ? item.href : null)}
              onFocusCapture={() => setDropdownOpen(hasChildren ? item.href : null)}
              onBlurCapture={(event) => {
                const nextTarget = event.relatedTarget as Node | null
                if (!event.currentTarget.contains(nextTarget)) {
                  scheduleCloseForCrossing()
                }
              }}
            >
              {hasChildren ? (
                <Link
                  href={item.href}
                  onPointerDown={(event) =>
                    handleParentPointerDown(event, item.href)
                  }
                  onClick={(event) => handleParentClick(event, item.href)}
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
        })}
      </ul>

      {displayDropdownItem ? (
        <div
          ref={dropdownShellRef}
          className="site-nav-dropdown-shell"
          data-open={isPanelOpen ? 'true' : 'false'}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={() => setDropdownOpen(null)}
        >
          <div className="site-nav-dropdown">
            <div className="site-shell site-nav-dropdown-inner">
              <section className="site-nav-dropdown-column">
                <p className="site-nav-dropdown-overline">主题分类</p>
                <div className="site-nav-dropdown-links">
                  {displayDropdownItem.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      prefetch={false}
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
