'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from './Navigation'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false)

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

  return (
    <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
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
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="site-mobile-toggle md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span />
          <span />
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="site-mobile-panel md:hidden">
          <div className="site-shell">
            <Navigation
              className="site-nav-mobile"
              mode="mobile"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </header>
  )
}
