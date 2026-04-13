'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Navigation from './Navigation'

export default function Header() {
  const MOBILE_MENU_ANIMATION_MS = 1000
  const [mobileMenuState, setMobileMenuState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed')
  const [isScrolled, setIsScrolled] = useState(false)
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const openTimerRef = useRef<number | null>(null)
  const mobileMenuVisible = mobileMenuState !== 'closed'
  const mobileMenuExpanded = mobileMenuState === 'opening' || mobileMenuState === 'open'

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('site-nav-overlay-open', desktopDropdownOpen)
    return () => {
      document.body.classList.remove('site-nav-overlay-open')
    }
  }, [desktopDropdownOpen])

  useEffect(() => {
    if (mobileMenuState !== 'opening') return
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    openTimerRef.current = window.setTimeout(() => {
      setMobileMenuState((prev) => (prev === 'opening' ? 'open' : prev))
      openTimerRef.current = null
    }, MOBILE_MENU_ANIMATION_MS)

    return () => {
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current)
        openTimerRef.current = null
      }
    }
  }, [mobileMenuState])

  useEffect(() => {
    if (!mobileMenuVisible) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuVisible])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current)
      }
    }
  }, [])

  const closeMobileMenu = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setMobileMenuState((prev) => {
      if (prev === 'closed' || prev === 'closing') return prev
      return 'closing'
    })
    closeTimerRef.current = window.setTimeout(() => {
      setMobileMenuState('closed')
      closeTimerRef.current = null
    }, MOBILE_MENU_ANIMATION_MS)
  }

  const toggleMobileMenu = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setMobileMenuState((prev) => {
      if (prev === 'closed') return 'opening'
      if (prev === 'closing') return 'opening'
      if (prev === 'opening' || prev === 'open') return 'closing'
      return prev
    })
    if (mobileMenuExpanded) {
      closeTimerRef.current = window.setTimeout(() => {
        setMobileMenuState('closed')
        closeTimerRef.current = null
      }, MOBILE_MENU_ANIMATION_MS)
    }
  }

  return (
    <header className={`site-header ${isScrolled ? 'is-scrolled' : ''} ${mobileMenuExpanded ? 'is-mobile-menu-open' : ''}`}>
      <div className="site-shell site-header-inner">
        <Link href="/" className="site-brand" aria-label="Go to homepage">
          <span className="site-brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3.5" y="6.5" width="17" height="12" rx="2.2" strokeWidth="1.6" />
              <circle cx="12" cy="12.5" r="3.3" strokeWidth="1.6" />
              <path d="M8 6.5l1.3-2h5.4l1.3 2" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <span className="site-brand-name">Photography</span>
        </Link>

        <Navigation
          className="site-nav-desktop hidden md:block"
          mode="desktop"
          onDropdownOpenChange={setDesktopDropdownOpen}
        />

        <button
          onClick={toggleMobileMenu}
          className="site-mobile-toggle md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuExpanded}
        >
          <span />
          <span />
        </button>
      </div>

      {mobileMenuVisible ? (
        <div className="site-mobile-panel md:hidden" data-state={mobileMenuState}>
          <div className="site-shell">
            <Navigation
              className="site-nav-mobile"
              mode="mobile"
              onNavigate={closeMobileMenu}
              onClose={closeMobileMenu}
            />
          </div>
        </div>
      ) : null}
    </header>
  )
}
