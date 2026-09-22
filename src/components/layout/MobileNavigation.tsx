'use client'

import { useCallback, useState } from 'react'
import MobileMenuContent from '@/components/layout/MobileMenuContent'
import Modal from '@/components/ui/Modal'
import type { NavigationItem } from '@/lib/site/types'

export default function MobileNavigation({ items }: { items: NavigationItem[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="site-mobile-toggle md:hidden"
        aria-label={isOpen ? '关闭菜单' : '打开菜单'}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-dialog"
      >
        <span />
        <span />
      </button>

      <Modal
        id="mobile-navigation-dialog"
        isOpen={isOpen}
        onClose={close}
        className="site-mobile-panel md:hidden"
        ariaLabel="移动导航"
      >
        <div className="site-shell">
          <MobileMenuContent
            items={items}
            className="site-nav-mobile"
            onNavigate={close}
            onClose={close}
          />
        </div>
      </Modal>
    </>
  )
}
