'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

type FooterTone = 'gray' | 'white'

const FOOTER_WHITE_RGB: [number, number, number] = [255, 255, 255]
const FOOTER_GRAY_RGB: [number, number, number] = [245, 245, 247]

function parseBackgroundColor(color: string): [number, number, number, number] | null {
  const rgbaMatch = color.match(/^rgba?\(([^)]+)\)$/i)
  if (!rgbaMatch) return null

  const parts = rgbaMatch[1]
    .split(',')
    .map((part) => Number.parseFloat(part.trim()))
    .filter((part) => Number.isFinite(part))

  if (parts.length < 3) return null
  const [r, g, b, a = 1] = parts
  return [r, g, b, a]
}

function isTransparent(color: string): boolean {
  if (color === 'transparent') return true
  const parsed = parseBackgroundColor(color)
  return parsed ? parsed[3] === 0 : false
}

function isNearColor(
  source: [number, number, number],
  target: [number, number, number],
  tolerance = 8
): boolean {
  return (
    Math.abs(source[0] - target[0]) <= tolerance &&
    Math.abs(source[1] - target[1]) <= tolerance &&
    Math.abs(source[2] - target[2]) <= tolerance
  )
}

function resolveSolidBackgroundColor(start: Element | null): [number, number, number] | null {
  let current: Element | null = start

  while (current && current !== document.documentElement) {
    const bg = window.getComputedStyle(current).backgroundColor
    if (!isTransparent(bg)) {
      const parsed = parseBackgroundColor(bg)
      if (parsed) return [parsed[0], parsed[1], parsed[2]]
    }
    current = current.parentElement
  }

  const bodyColor = window.getComputedStyle(document.body).backgroundColor
  const parsedBody = parseBackgroundColor(bodyColor)
  return parsedBody ? [parsedBody[0], parsedBody[1], parsedBody[2]] : null
}

export default function Footer() {
  const pathname = usePathname()
  const footerRef = useRef<HTMLElement | null>(null)
  const [tone, setTone] = useState<FooterTone>('gray')

  const detectTone = useCallback(() => {
    const footer = footerRef.current
    if (!footer) return

    const rect = footer.getBoundingClientRect()
    if (rect.top > window.innerHeight + 8 || rect.bottom < -8) {
      return
    }

    const sampleY = Math.min(window.innerHeight - 1, Math.max(0, Math.floor(rect.top) - 2))
    const sampleXs = [0.2, 0.5, 0.8].map((ratio) => Math.floor(window.innerWidth * ratio))
    let colorAboveFooter: [number, number, number] | null = null

    for (const sampleX of sampleXs) {
      const stack = document.elementsFromPoint(sampleX, sampleY)
      const candidate = stack.find((element) => !footer.contains(element))
      const resolved = resolveSolidBackgroundColor(candidate ?? null)
      if (resolved) {
        colorAboveFooter = resolved
        break
      }
    }

    if (!colorAboveFooter) {
      colorAboveFooter = resolveSolidBackgroundColor(footer.previousElementSibling)
    }

    if (!colorAboveFooter) {
      setTone('gray')
      return
    }

    if (isNearColor(colorAboveFooter, FOOTER_GRAY_RGB)) {
      setTone('white')
      return
    }

    if (isNearColor(colorAboveFooter, FOOTER_WHITE_RGB)) {
      setTone('gray')
      return
    }

    const luminance = (0.2126 * colorAboveFooter[0] + 0.7152 * colorAboveFooter[1] + 0.0722 * colorAboveFooter[2]) / 255
    setTone(luminance > 0.9 ? 'gray' : 'white')
  }, [])

  useEffect(() => {
    let rafId: number | null = null
    const scheduleDetect = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        detectTone()
      })
    }

    scheduleDetect()

    const main = document.querySelector('.site-main')
    const observer = new MutationObserver(scheduleDetect)
    if (main) {
      observer.observe(main, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
      })
    }

    window.addEventListener('resize', scheduleDetect)
    window.addEventListener('scroll', scheduleDetect, { passive: true })
    window.addEventListener('load', scheduleDetect)

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      observer.disconnect()
      window.removeEventListener('resize', scheduleDetect)
      window.removeEventListener('scroll', scheduleDetect)
      window.removeEventListener('load', scheduleDetect)
    }
  }, [pathname, detectTone])

  return (
    <footer ref={footerRef} className="site-footer">
      <section className={`site-footer-band site-footer-band--${tone}`}>
        <div className="site-shell site-footer-simple">
          <div className="site-footer-simple-grid">
            <section className="site-footer-simple-column" aria-label="摄影">
              <h3>摄影</h3>
              <ul>
                <li>
                  <Link href="/photography">总览</Link>
                </li>
                <li>
                  <Link href="/photography/street">街拍</Link>
                </li>
                <li>
                  <Link href="/photography/pets">动物</Link>
                </li>
                <li>
                  <Link href="/photography/project">项目</Link>
                </li>
              </ul>
            </section>

            <section className="site-footer-simple-column" aria-label="旅行">
              <h3>旅行</h3>
              <ul>
                <li>
                  <Link href="/travel">总览</Link>
                </li>
                <li>
                  <Link href="/travel/japan">日本</Link>
                </li>
                <li>
                  <Link href="/travel/nanjing">南京</Link>
                </li>
                <li>
                  <Link href="/travel/hangzhou">杭州</Link>
                </li>
              </ul>
            </section>

            <section className="site-footer-simple-column" aria-label="爱好">
              <h3>爱好</h3>
              <ul>
                <li>
                  <Link href="/hobby#reading">阅读</Link>
                </li>
                <li>
                  <Link href="/hobby#film">电影</Link>
                </li>
                <li>
                  <Link href="/hobby#game">游戏</Link>
                </li>
              </ul>
            </section>

            <section className="site-footer-simple-column" aria-label="联系">
              <h3>联系</h3>
              <ul>
                <li>微信: Aluck714</li>
                <li className="site-footer-contact-email">邮箱: Jackylin714@gmail.com</li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </footer>
  )
}
