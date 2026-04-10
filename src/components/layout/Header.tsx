'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from './Navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="portfolio-shell">
        <div className="flex h-[4.4rem] items-center justify-between gap-6">
          <Link
            href="/"
            className="font-editorial-sans flex items-center gap-4 transition-opacity hover:opacity-80"
          >
            <span className="portfolio-eyebrow !text-[0.62rem] !tracking-[0.42em]">Zhlin</span>
            <span className="text-[0.86rem] font-semibold uppercase tracking-[0.26em] text-[color:var(--portfolio-text)]">
              Photography
            </span>
          </Link>

          <div className="hidden items-center gap-5 md:flex">
            <Navigation />
            <div className="border-l border-[color:var(--portfolio-border)] pl-5">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full border border-[color:var(--portfolio-border)] p-2.5 text-[color:var(--portfolio-text)] transition hover:bg-white/20 dark:hover:bg-white/5"
              aria-label="切换菜单"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[color:var(--portfolio-border)] py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </MobileNavLink>
              <MobileNavDropdown
                label="Photography"
                links={[
                  { label: 'Street', href: '/photography/street' },
                  { label: 'Pets', href: '/photography/pets' },
                  { label: 'Project', href: '/photography/project' },
                ]}
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileNavLink href="/travel" onClick={() => setMobileMenuOpen(false)}>
                Travel
              </MobileNavLink>
              <MobileNavLink href="/hobby" onClick={() => setMobileMenuOpen(false)}>
                Hobby
              </MobileNavLink>
              <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </MobileNavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="site-mobile-link px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.2em]"
    >
      {children}
    </Link>
  )
}

function MobileNavDropdown({
  label,
  links,
  onClick,
}: {
  label: string
  links: { label: string; href: string }[]
  onClick: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="site-mobile-link flex w-full items-center justify-between px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.2em]"
      >
        {label}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
      {isOpen && (
        <div className="ml-4 mt-2 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClick}
              className="site-mobile-link px-4 py-2.5 text-[0.74rem] font-medium uppercase tracking-[0.18em]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
