'use client'

import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function Modal({
  isOpen,
  onClose,
  children,
  className,
  id,
  ariaLabel,
  labelledBy,
  initialFocusRef,
  onKeyDown,
}: {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className: string
  id?: string
  ariaLabel?: string
  labelledBy?: string
  initialFocusRef?: RefObject<HTMLElement | null>
  onKeyDown?: (event: KeyboardEvent) => void
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const onCloseRef = useRef(onClose)
  const onKeyDownRef = useRef(onKeyDown)

  useEffect(() => {
    onCloseRef.current = onClose
    onKeyDownRef.current = onKeyDown
  }, [onClose, onKeyDown])

  useEffect(() => {
    if (!isOpen) return

    const dialog = dialogRef.current
    const siteRoot = document.getElementById('site-root')
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow
    const previousAriaHidden = siteRoot?.getAttribute('aria-hidden') ?? null
    const previousInert = siteRoot?.inert ?? false

    document.body.style.overflow = 'hidden'
    if (siteRoot) {
      siteRoot.inert = true
      siteRoot.setAttribute('aria-hidden', 'true')
    }

    const focusTarget =
      initialFocusRef?.current
      || dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      || dialog
    focusTarget?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key === 'Tab' && dialog) {
        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter(
          (element) =>
            !element.hasAttribute('disabled')
            && element.getAttribute('aria-hidden') !== 'true',
        )

        if (focusable.length === 0) {
          event.preventDefault()
          dialog.focus()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      onKeyDownRef.current?.(event)
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = previousOverflow
      if (siteRoot) {
        siteRoot.inert = previousInert
        if (previousAriaHidden === null) {
          siteRoot.removeAttribute('aria-hidden')
        } else {
          siteRoot.setAttribute('aria-hidden', previousAriaHidden)
        }
      }
      previouslyFocused?.focus()
    }
  }, [initialFocusRef, isOpen])

  if (!isOpen || typeof document === 'undefined') {
    return null
  }

  const portalRoot = document.getElementById('modal-root') || document.body

  return createPortal(
    <div
      ref={dialogRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      tabIndex={-1}
      className={className}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      {children}
    </div>,
    portalRoot,
  )
}
