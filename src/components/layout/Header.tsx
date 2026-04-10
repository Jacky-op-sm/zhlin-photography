'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from './Navigation'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="site-shell site-header-inner">
        <Link href="/" className="site-brand" aria-label="Go to homepage">
          <span className="site-brand-mark">Zhlin</span>
          <span className="site-brand-name">Photography.</span>
        </Link>

        <Navigation className="site-nav-desktop hidden md:block" />

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
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </header>
  )
}
