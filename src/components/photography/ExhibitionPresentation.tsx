'use client'

import { useEffect, useRef, type RefObject } from 'react'

export { TRANSITION_MS } from './exhibition-images'
export { ExhibitionImage } from './ExhibitionImage'

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
