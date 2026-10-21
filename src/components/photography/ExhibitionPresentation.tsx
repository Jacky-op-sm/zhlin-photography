'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import Image from 'next/image'
import type { ExhibitionPhoto } from './PhotographyExhibition'
import styles from './PhotographyExhibition.module.css'

export const IMAGE_SIZES = '(max-width: 960px) 92vw, 59vw'
export const TRANSITION_MS = 1000

export function useExhibitionCursor(stageRef: RefObject<HTMLDivElement | null>, labelRef: RefObject<HTMLDivElement | null>, collectionId: string | undefined, blocked: boolean) {
  const lastPointer = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const stage = stageRef.current
    const label = labelRef.current
    if (!stage || !label) return
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let frame = 0
    let entryTimer: ReturnType<typeof setTimeout> | undefined
    let exitTimer: ReturnType<typeof setTimeout> | undefined
    let smallTimer: ReturnType<typeof setTimeout> | undefined
    let active = false
    let x = window.innerWidth / 2 - label.offsetWidth / 2
    let y = window.innerHeight / 2 - label.offsetHeight / 2
    let targetX = x
    let targetY = y
    const draw = () => {
      x += (targetX - x) * .5
      y += (targetY - y) * .5
      const maxX = Math.max(8, window.innerWidth - label.offsetWidth - 8)
      const maxY = Math.max(8, window.innerHeight - label.offsetHeight - 8)
      label.style.transform = `translate3d(${Math.max(8, Math.min(x, maxX))}px, ${Math.max(8, Math.min(y, maxY))}px, 0)`
      if (active && (Math.abs(targetX - x) > .1 || Math.abs(targetY - y) > .1)) frame = requestAnimationFrame(draw)
      else frame = 0
    }
    const hide = () => {
      active = false
      stage.dataset.cursorActive = 'false'
      label.dataset.visible = 'false'
      clearTimeout(entryTimer)
      entryTimer = undefined
      cancelAnimationFrame(frame)
      frame = 0
    }
    const show = () => {
      if (blocked || !finePointer.matches) return hide()
      active = true
      stage.dataset.cursorActive = 'true'
      label.dataset.visible = 'true'
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const initialize = () => {
      hide()
      clearTimeout(smallTimer)
      if (blocked || !finePointer.matches) return
      label.dataset.size = 'large'
      const pointer = lastPointer.current
      if (pointer) { x = targetX = pointer.x; y = targetY = pointer.y }
      draw()
      if (!pointer || document.elementFromPoint(pointer.x, pointer.y)?.closest('[data-exhibition-surface]')) show()
      smallTimer = setTimeout(() => { label.dataset.size = 'small' }, 2000)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || blocked || !finePointer.matches) return
      lastPointer.current = { x: event.clientX, y: event.clientY }
      targetX = event.clientX
      targetY = event.clientY
      const overStage = event.target instanceof Element && !!event.target.closest('[data-exhibition-surface]') && !event.target.closest('[data-exhibition-ui]')
      clearTimeout(exitTimer)
      if (!overStage) return hide()
      if (!active && !entryTimer) entryTimer = setTimeout(() => { entryTimer = undefined; show() }, 100)
      else if (!frame) frame = requestAnimationFrame(draw)
    }
    const onLeave = () => { clearTimeout(exitTimer); exitTimer = setTimeout(hide, 200) }
    initialize()
    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    window.addEventListener('blur', hide)
    finePointer.addEventListener('change', initialize)
    return () => {
      hide()
      clearTimeout(exitTimer)
      clearTimeout(smallTimer)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('blur', hide)
      finePointer.removeEventListener('change', initialize)
    }
  }, [stageRef, labelRef, collectionId, blocked])
}

// Keep the decoded photograph until its successor is ready. A DOM request marker
// prevents a late image event from winning over rapid navigation or browser Back.
export function ExhibitionImage({ photo, collectionId, onPresent }: { photo: ExhibitionPhoto; collectionId: string; onPresent: (collectionId: string, photoId: string) => void }) {
  const [view, setView] = useState({ photo, collectionId, previous: null as ExhibitionPhoto | null })
  const [failedRequest, setFailedRequest] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const frameRef = useRef<HTMLDivElement>(null)
  const clearTransition = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestKey = `${collectionId}/${photo.id}`
  const displayedKey = `${view.collectionId}/${view.photo.id}`
  const pending = requestKey !== displayedKey
  const failed = failedRequest === requestKey
  useEffect(() => () => { if (clearTransition.current) clearTimeout(clearTransition.current) }, [])
  const present = () => {
    if (frameRef.current?.dataset.requested !== requestKey) return
    if (clearTransition.current) clearTimeout(clearTransition.current)
    const animate = view.collectionId !== collectionId
    setView((previous) => ({ photo, collectionId, previous: animate ? previous.photo : null }))
    setFailedRequest(null)
    onPresent(collectionId, photo.id)
    if (animate) clearTransition.current = setTimeout(() => setView((current) => ({ ...current, previous: null })), TRANSITION_MS)
  }
  return (
    <div ref={frameRef} className={styles.imageFrame} data-testid="exhibition-image-frame" data-requested={requestKey} data-state={failed ? 'error' : pending ? 'loading' : view.previous ? 'transitioning' : 'ready'} aria-busy={pending && !failed}>
      {view.previous ? <div className={styles.imageLayer} data-orientation={view.previous.width > view.previous.height ? 'landscape' : 'portrait'} aria-hidden="true"><Image src={view.previous.src} alt="" width={view.previous.width} height={view.previous.height} className={styles.image} sizes={IMAGE_SIZES} loading="eager" draggable={false} /></div> : null}
      <div key={`${displayedKey}/${retry}`} className={`${styles.imageLayer} ${view.previous ? styles.collectionIncoming : ''}`} data-orientation={view.photo.width > view.photo.height ? 'landscape' : 'portrait'}>
        <Image src={view.photo.src} alt={view.photo.alt} width={view.photo.width} height={view.photo.height} className={styles.image} data-testid="exhibition-image" data-photo-id={view.photo.id} sizes={IMAGE_SIZES} loading="eager" fetchPriority="high" draggable={false} onLoad={() => { if (frameRef.current?.dataset.requested === displayedKey) { setFailedRequest(null); onPresent(view.collectionId, view.photo.id) } }} onError={() => { if (frameRef.current?.dataset.requested === displayedKey) setFailedRequest(displayedKey) }} />
      </div>
      {pending ? <div className={styles.pendingImage} aria-hidden="true"><Image key={`${requestKey}/${retry}`} src={photo.src} alt="" width={photo.width} height={photo.height} sizes={IMAGE_SIZES} loading="eager" fetchPriority="high" onLoad={present} onError={() => { if (frameRef.current?.dataset.requested === requestKey) setFailedRequest(requestKey) }} /></div> : null}
      {view.previous ? <div key={`curtain-${displayedKey}`} className={styles.collectionCurtain} aria-hidden="true" /> : null}
      {failed ? <div className={styles.imageError} role="alert" data-exhibition-ui><span>This photograph could not load.</span><button type="button" onClick={() => { setFailedRequest(null); setRetry((value) => value + 1) }}>Retry</button></div> : null}
    </div>
  )
}
