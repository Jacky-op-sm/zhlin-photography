'use client'

import { getImageProps } from 'next/image'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ExhibitionPhoto } from './PhotographyExhibition'
import { getExhibitionImageSizes, TRANSITION_MS } from './exhibition-images'
import styles from './PhotographyExhibition.module.css'

type Target = { photo: ExhibitionPhoto; collectionId: string }
type View = { target: Target; previous: Target | null; revealed: boolean; transition: number }
type DecodedImage = { image: HTMLImageElement; src: string }
const targetKey = (target: Target) => `${target.collectionId}/${target.photo.id}`
const MAX_IMAGES = 6

function ImageLayer({ target, active, visible, requested, register, decode, fail }: {
  target: Target
  active: boolean
  visible: boolean
  requested: boolean
  register: (key: string, image: HTMLImageElement | null) => void
  decode: (target: Target, image: HTMLImageElement) => void
  fail: (key: string) => void
}) {
  const key = targetKey(target)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const setImage = useCallback((image: HTMLImageElement | null) => {
    imageRef.current = image
    register(key, image)
  }, [key, register])
  useLayoutEffect(() => {
    const image = imageRef.current
    // A cached/SSR image may finish before React attaches its load handler.
    if (image?.complete && image.naturalWidth > 0) decode(target, image)
  }, [target, decode])
  const { props } = getImageProps({
    src: target.photo.src, alt: active ? target.photo.alt : '',
    width: target.photo.width, height: target.photo.height,
    sizes: getExhibitionImageSizes(target.photo), loading: 'eager',
    fetchPriority: requested ? 'high' : 'low',
  })
  const className = [styles.imageLayer, !visible ? styles.preparedImage : ''].join(' ')
  return <div className={className} data-orientation={target.photo.width > target.photo.height ? 'landscape' : 'portrait'} aria-hidden={active ? undefined : true}>
    {/* Next generates the same responsive URLs; retaining the native node lets us
        decode once, promote it directly, and observe responsive source changes. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img {...props} alt={props.alt} ref={setImage} className={styles.image} draggable={false}
      data-testid={active ? 'exhibition-image' : undefined} data-photo-id={target.photo.id}
      onLoad={(event) => decode(target, event.currentTarget)} onError={() => fail(key)} />
  </div>
}

export function ExhibitionImage({ photo, collectionId, neighbours, locationHash, onPresent }: {
  photo: ExhibitionPhoto
  collectionId: string
  neighbours: Target[]
  locationHash: string
  onPresent: (collectionId: string, photoId: string) => void
}) {
  const requested = useMemo(() => ({ photo, collectionId }), [photo, collectionId])
  const requestKey = targetKey(requested)
  const [view, setView] = useState<View>({ target: requested, previous: null, revealed: true, transition: 0 })
  const [prepared, setPrepared] = useState<Target[]>([])
  const [failedRequest, setFailedRequest] = useState<string | null>(null)
  const [retries, setRetries] = useState<Record<string, number>>({})
  const frameRef = useRef<HTMLDivElement>(null)
  const images = useRef(new Map<string, HTMLImageElement>())
  const decoded = useRef(new Map<string, DecodedImage>())
  const decoding = useRef(new Map<HTMLImageElement, { src: string }>())
  const failures = useRef(new Set<string>())
  const latest = useRef({ target: requested, neighbours, locationHash, onPresent })
  const promoted = useRef(requestKey)
  const notified = useRef('')
  const preparedSignature = useRef('')
  const transition = useRef(0)

  const present = useCallback((target: Target, image: HTMLImageElement) => {
    const key = targetKey(target)
    const current = latest.current
    const ready = decoded.current.get(key)
    if (frameRef.current?.dataset.requested !== key || targetKey(current.target) !== key
      || images.current.get(key) !== image || !image.complete || !image.naturalWidth
      || ready?.image !== image || ready.src !== image.currentSrc) return

    if (promoted.current !== key) {
      promoted.current = key
      const version = ++transition.current
      setView((previous) => {
        // An interrupted transition may still show its outgoing photograph.
        const visible = previous.previous && !previous.revealed ? previous.previous : previous.target
        return {
          target,
          previous: previous.target.collectionId !== target.collectionId ? visible : null,
          revealed: false,
          transition: version,
        }
      })
    }
    setFailedRequest((value) => value === key ? null : value)
    const notice = `${key}\n${image.currentSrc}`
    if (notified.current !== notice) {
      notified.current = notice
      current.onPresent(target.collectionId, target.photo.id)
    }

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    // Deep-link hydration must not prepare neighbours of the SSR fallback.
    const next = window.location.hash === current.locationHash && !connection?.saveData ? current.neighbours : []
    const signature = next.map(targetKey).join('\n')
    if (signature !== preparedSignature.current) {
      preparedSignature.current = signature
      setPrepared(next)
    }
  }, [])

  const fail = useCallback((key: string) => {
    decoded.current.delete(key)
    failures.current.add(key)
    if (frameRef.current?.dataset.requested === key) setFailedRequest(key)
  }, [])

  const decode = useCallback((target: Target, image: HTMLImageElement) => {
    const key = targetKey(target)
    if (images.current.get(key) !== image) return
    const src = image.currentSrc || image.src
    const ready = decoded.current.get(key)
    if (ready?.image === image && ready.src === src && image.complete && image.naturalWidth > 0) {
      present(target, image)
      return
    }
    if (decoding.current.get(image)?.src === src) return
    const job = { src }
    decoding.current.set(image, job)
    void image.decode().then(() => {
      if (!image.isConnected || images.current.get(key) !== image || image.currentSrc !== src
        || !image.complete || !image.naturalWidth) return
      decoded.current.set(key, { image, src })
      failures.current.delete(key)
      present(target, image)
    }).catch(() => {
      if (image.isConnected && images.current.get(key) === image && image.currentSrc === src) fail(key)
    }).finally(() => {
      if (decoding.current.get(image) === job) decoding.current.delete(image)
    })
  }, [fail, present])

  const register = useCallback((key: string, image: HTMLImageElement | null) => {
    if (image) images.current.set(key, image)
    else {
      const previous = images.current.get(key)
      if (previous) decoding.current.delete(previous)
      images.current.delete(key)
      decoded.current.delete(key)
      failures.current.delete(key)
    }
  }, [])

  useLayoutEffect(() => {
    latest.current = { target: requested, neighbours, locationHash, onPresent }
    const image = images.current.get(requestKey)
    if (failures.current.has(requestKey)) {
      setFailedRequest((value) => value === requestKey ? value : requestKey)
    } else if (image) decode(requested, image)
  }, [requested, neighbours, locationHash, onPresent, requestKey, decode])
  useLayoutEffect(() => {
    if (!view.previous) return
    const version = view.transition
    // Swap both layers in one render while the curtain covers the stage.
    // Independent image animations can drift when navigation interrupts them.
    const revealTimer = setTimeout(() => {
      setView((value) => value.transition === version ? { ...value, revealed: true } : value)
    }, TRANSITION_MS / 2)
    const clearTimer = setTimeout(() => {
      setView((value) => value.transition === version ? { ...value, previous: null } : value)
    }, TRANSITION_MS)
    return () => { clearTimeout(revealTimer); clearTimeout(clearTimer) }
  }, [view.previous, view.transition])

  const displayedKey = targetKey(view.target)
  const visibleKey = view.previous && !view.revealed ? targetKey(view.previous) : displayedKey
  const pending = requestKey !== displayedKey
  const failed = failedRequest === requestKey
  // Keep the requested, displayed and outgoing nodes before filling the small
  // lookahead window. Reordering keyed layers never replaces their decoded img.
  const layers = [...new Map([requested, view.target, ...(view.previous ? [view.previous] : []), ...prepared]
    .map((target) => [targetKey(target), target])).values()].slice(0, MAX_IMAGES)
  return <div ref={frameRef} className={styles.imageFrame} data-testid="exhibition-image-frame" data-requested={requestKey}
    data-state={failed ? 'error' : pending ? 'loading' : view.previous ? 'transitioning' : 'ready'} aria-busy={pending && !failed}>
    {layers.map((target) => {
      const key = targetKey(target)
      return <ImageLayer key={`${key}/${retries[key] ?? 0}`} target={target}
        active={key === displayedKey} visible={key === visibleKey}
        requested={key === requestKey} register={register} decode={decode} fail={fail} />
    })}
    {view.previous ? <div key={`curtain-${view.transition}`} className={styles.collectionCurtain} aria-hidden="true" /> : null}
    {failed ? <div className={styles.imageError} role="alert" data-exhibition-ui><span>This photograph could not load.</span><button type="button" onClick={() => {
      failures.current.delete(requestKey)
      decoded.current.delete(requestKey)
      setFailedRequest(null)
      setRetries((value) => ({ ...value, [requestKey]: (value[requestKey] ?? 0) + 1 }))
    }}>Retry</button></div> : null}
  </div>
}
