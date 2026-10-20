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

type Gesture = { x: number; y: number; endX: number; endY: number; identifier: number }

const subscribeToHydration = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

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
  const [{ index: activeIndex, direction }, setSelection] = useState({ index: 0, direction: 1 })
  const activeIndexRef = useRef(0)
  const imageRefs = useRef<(HTMLImageElement | null)[]>([])
  const gestureRef = useRef<Gesture | null>(null)

  useEffect(() => {
    // Decode both neighbours ahead of a gesture, including the first/last seam.
    // Keep the existing source files and display dimensions on every device.
    if (!enhanced || images.length < 2) return
    for (const offset of [-1, 1]) {
      const index = (activeIndex + offset + images.length) % images.length
      const image = imageRefs.current[index]
      if (image) void image.decode().catch(() => { /* Native image fallback handles load failures. */ })
    }
  }, [activeIndex, enhanced, images.length])

  const navigate = useCallback((direction: -1 | 1) => {
    if (images.length < 2) return
    const next = (activeIndexRef.current + direction + images.length) % images.length
    activeIndexRef.current = next
    setSelection({ index: next, direction })
  }, [images.length])

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
    data-direction={direction === 1 ? 'forward' : 'backward'}
    aria-label="照片组"
    onKeyDown={handleKeyDown}
  >
    <noscript><style>{noScriptStyles}</style></noscript>
    <div className="writing-figure-mat writing-stack-mat">
      <div
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
          return <div
            key={image.src}
            className="writing-stack-slide"
            data-active={index === activeIndex ? 'true' : 'false'}
            data-position={position}
            data-full-src={image.src}
            aria-hidden={enhanced && index !== activeIndex ? true : undefined}
          >
            {/* The shared figure styles retain the already-published image size. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={element => { imageRefs.current[index] = element }}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading={index === 0 || (enhanced && (depth === 0 || depth === 1 || depth === images.length - 1)) ? 'eager' : 'lazy'}
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
        disabled={images.length < 2}
        onClick={() => navigate(-1)}
      ><Chevron direction="previous" /></button>
      <button
        type="button"
        className="writing-stack-nav writing-stack-nav--next"
        aria-label="下一张照片"
        disabled={images.length < 2}
        onClick={() => navigate(1)}
      ><Chevron direction="next" /></button>
    </div>
    <figcaption className="writing-stack-caption" aria-live="polite" aria-atomic="true">
      <span className="writing-stack-counter">{activeIndex + 1} / {images.length}</span>
      {images[activeIndex].caption && <span className="writing-stack-month">{images[activeIndex].caption}</span>}
    </figcaption>
  </figure>
}
