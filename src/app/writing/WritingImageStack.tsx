'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type TouchEvent,
} from 'react'
import './writing-image-stack.css'

export type WritingStackImage = {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

type Turn = { previous: number; direction: -1 | 1 }
type Gesture = { x: number; y: number; endX: number; endY: number; identifier: number }

const TURN_DURATION = 420
const subscribeToHydration = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false
const getReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const subscribeToReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

// The original four image elements form an ordinary photo sequence without JS.
// A noscript stylesheet preserves that fallback without a hydration layout jump.
const noScriptStyles = `
.writing-image-stack .writing-stack-stage { display: block !important; }
.writing-image-stack .writing-stack-slide { position: static !important; opacity: 1 !important; transform: none !important; margin: 0 0 2rem !important; }
.writing-image-stack .writing-stack-slide:last-child { margin-bottom: 0 !important; }
.writing-image-stack .writing-stack-caption-fallback { display: block !important; }
.writing-image-stack .writing-stack-nav, .writing-image-stack > .writing-stack-caption { display: none !important; }
`

function Chevron({ direction }: { direction: 'previous' | 'next' }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={direction === 'previous' ? 'M14 5 7 12l7 7' : 'm10 5 7 7-7 7'} />
  </svg>
}

export default function WritingImageStack({ images }: { images: WritingStackImage[] }) {
  const enhanced = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot)
  const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotion, getServerSnapshot)
  const [activeIndex, setActiveIndex] = useState(0)
  const [turn, setTurn] = useState<Turn | null>(null)
  const activeIndexRef = useRef(0)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const turnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gestureRef = useRef<Gesture | null>(null)

  useEffect(() => () => {
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current)
  }, [])

  const navigate = useCallback((direction: -1 | 1) => {
    const previous = activeIndexRef.current
    const next = Math.max(0, Math.min(images.length - 1, previous + direction))
    if (next === previous) return

    activeIndexRef.current = next
    setActiveIndex(next)
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current)
    if (reducedMotion) {
      setTurn(null)
    } else {
      setTurn({ previous, direction })
      turnTimerRef.current = setTimeout(() => setTurn(null), TURN_DURATION)
    }

    // At an endpoint the pressed arrow becomes disabled; keep keyboard focus in
    // the gallery so the reader can immediately go in the opposite direction.
    if ((next === 0 || next === images.length - 1)
      && document.activeElement?.classList.contains('writing-stack-nav')) {
      requestAnimationFrame(() => stageRef.current?.focus({ preventScroll: true }))
    }
  }, [images.length, reducedMotion])

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) {
      gestureRef.current = null
      return
    }
    const touch = event.touches[0]
    gestureRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      endX: touch.clientX,
      endY: touch.clientY,
      identifier: touch.identifier,
    }
  }

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    if (!gesture || event.touches.length !== 1) {
      gestureRef.current = null
      return
    }
    const touch = event.touches[0]
    if (touch.identifier !== gesture.identifier) {
      gestureRef.current = null
      return
    }
    gesture.endX = touch.clientX
    gesture.endY = touch.clientY
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    gestureRef.current = null
    if (!gesture || event.touches.length !== 0) return
    const touch = Array.from(event.changedTouches).find(item => item.identifier === gesture.identifier)
    const dx = (touch?.clientX ?? gesture.endX) - gesture.x
    const dy = (touch?.clientY ?? gesture.endY) - gesture.y
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.35) return
    navigate(dx < 0 ? 1 : -1)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      navigate(event.key === 'ArrowLeft' ? -1 : 1)
    }
  }

  if (images.length === 0) return null

  return <figure
    className="writing-figure writing-image-stack"
    data-enhanced={enhanced ? 'true' : 'false'}
    aria-label="照片组"
    onKeyDown={handleKeyDown}
  >
    <noscript><style>{noScriptStyles}</style></noscript>
    <div className="writing-figure-mat writing-stack-mat">
      <div
        ref={stageRef}
        className="writing-stack-stage"
        role="group"
        aria-label="照片轮播，使用左右方向键切换"
        tabIndex={enhanced ? 0 : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => { gestureRef.current = null }}
      >
        {images.map((image, index) => {
          const depth = (index - activeIndex + images.length) % images.length
          const position = depth === 0 ? 'active' : depth === 1 ? 'behind-1' : depth === 2 ? 'behind-2' : 'hidden'
          const outgoing = turn?.previous === index ? turn.direction === 1 ? 'forward' : 'backward' : undefined
          return <div
            key={image.src}
            className="writing-stack-slide"
            data-active={index === activeIndex ? 'true' : 'false'}
            data-position={position}
            data-outgoing={outgoing}
            data-full-src={image.src}
            aria-hidden={enhanced && index !== activeIndex ? true : undefined}
          >
            {/* The shared figure styles retain the already-published image size. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
            {image.caption && <span className="writing-stack-caption-fallback">{image.caption}</span>}
          </div>
        })}
      </div>
      <button
        type="button"
        className="writing-stack-nav writing-stack-nav--previous"
        aria-label="上一张照片"
        disabled={activeIndex === 0}
        onClick={() => navigate(-1)}
      ><Chevron direction="previous" /></button>
      <button
        type="button"
        className="writing-stack-nav writing-stack-nav--next"
        aria-label="下一张照片"
        disabled={activeIndex === images.length - 1}
        onClick={() => navigate(1)}
      ><Chevron direction="next" /></button>
    </div>
    <figcaption className="writing-stack-caption" aria-live="polite" aria-atomic="true">
      <span className="writing-stack-counter">{activeIndex + 1} / {images.length}</span>
      {images[activeIndex].caption && <span className="writing-stack-month">{images[activeIndex].caption}</span>}
    </figcaption>
  </figure>
}
