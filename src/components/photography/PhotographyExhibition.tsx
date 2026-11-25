'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Modal from '@/components/ui/Modal'
import profile from '../../../content/site/profile.json'
import { ExhibitionImage, useExhibitionCursor, TRANSITION_MS } from './ExhibitionPresentation'
import { cropRatio } from './exhibition-images'
import { observeLandscapeCaption } from './landscape-caption'
import styles from './PhotographyExhibition.module.css'

type Caption = { place: string; eyebrow: string; title: string; body: string }
type Section = 'works' | 'travels'
const indexTabs = ['works', 'travels', 'info'] as const
type IndexTab = (typeof indexTabs)[number]

export interface ExhibitionPhoto { focus?: string; caption?: Caption; id: string; src: string; thumbnail: string; width: number; height: number; alt: string }
export interface ExhibitionCollection { section?: Section; id: string; title: string; description?: string; photos: ExhibitionPhoto[] }
interface PhotographyExhibitionProps { collections: ExhibitionCollection[]; initialCollectionId?: string }
type Selection = { collection: ExhibitionCollection; photoIndex: number }
type Panel = { kind: 'index' | 'thumbs'; phase: 'entering' | 'open' | 'closing' }

function subscribeToLocation(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  window.addEventListener('popstate', onChange)
  return () => { window.removeEventListener('hashchange', onChange); window.removeEventListener('popstate', onChange) }
}
function locationSnapshot() { return window.location.hash }
function serverLocationSnapshot() { return '' }
function photoHash(collectionId: string, photoId: string) { return `#${collectionId.split('/').map(encodeURIComponent).join('/')}/${encodeURIComponent(photoId)}` }
function resolveSelection(hash: string, collections: ExhibitionCollection[], initialId?: string): Selection | null {
  const fallback = collections.find((collection) => collection.id === initialId) ?? collections[0]
  if (!fallback) return null
  try {
    const parts = hash.slice(1).split('/').map(decodeURIComponent)
    if (hash === '#travels') return { collection: collections.find(item => item.section === 'travels') ?? fallback, photoIndex: 0 }
    const photoId = parts.pop()
    const collectionId = parts.join('/')
    const collection = collections.find((item) => item.id === collectionId)
    const photoIndex = collection?.photos.findIndex((photo) => photo.id === photoId) ?? -1
    if (collection && photoIndex >= 0) return { collection, photoIndex }
    if (collection?.section === 'travels') return { collection, photoIndex: 0 }
  } catch { /* A malformed or stale photo link opens the default exhibition. */ }
  return { collection: fallback, photoIndex: 0 }
}

export default function PhotographyExhibition({ collections, initialCollectionId }: PhotographyExhibitionProps) {
  const availableCollections = useMemo(() => collections.filter((collection) => collection.photos.length > 0), [collections])
  const hash = useSyncExternalStore(subscribeToLocation, locationSnapshot, serverLocationSnapshot)
  const selection = useMemo(() => resolveSelection(hash, availableCollections, initialCollectionId), [hash, availableCollections, initialCollectionId])
  const [presented, setPresented] = useState(() => selection && { ...selection, decoded: false })
  const [panel, setPanel] = useState<Panel | null>(null)
  const [preview, setPreview] = useState<Selection | null>(null)
  const [tab, setTab] = useState<{ active: IndexTab; displayed: IndexTab; fading: boolean }>({ active: 'works', displayed: 'works', fading: false })
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const tabRefs = useRef<Partial<Record<IndexTab, HTMLButtonElement | null>>>({})
  const indexTrigger = useRef<HTMLButtonElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const captionsRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLElement>(null)
  const positionRef = useRef<HTMLParagraphElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tabTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const suppressClickUntil = useRef(0)
  const collection = selection?.collection
  const photoIndex = selection?.photoIndex ?? 0
  const photo = collection?.photos[photoIndex]
  const shown = hash === '#travels' ? selection : presented ?? selection
  const shownCollection = shown?.collection
  const shownIndex = shown?.photoIndex ?? 0
  const isTravel = shownCollection?.section === 'travels'
  const shownPhoto = shownCollection?.photos[shownIndex]
  const ratio = shownPhoto ? cropRatio(shownPhoto) : 1
  const travelLayout = isTravel ? (ratio > 1 ? 'landscape' : 'portrait') : undefined
  const section = collection?.section ?? 'works'
  const sectionCollections = useMemo(() => availableCollections.filter(item => (item.section ?? 'works') === section), [availableCollections, section])
  const tabCollections = useMemo(() => availableCollections.filter(item => (item.section ?? 'works') === tab.displayed), [availableCollections, tab.displayed])
  const collectionIndex = sectionCollections.findIndex((item) => item.id === collection?.id)
  const sequence = useMemo(() => sectionCollections.flatMap((item) => item.photos.map((entry) => ({ photo: entry, collectionId: item.id }))), [sectionCollections])
  const neighbours = useMemo(() => {
    const index = sequence.findIndex((item) => item.collectionId === collection?.id && item.photo.id === photo?.id)
    const adjacent = [1, -1, 2, -2, 3].map((offset) => sequence[index + offset]).filter((item) => item !== undefined)
    if (!panel || panel.phase === 'closing') return adjacent
    const intended = preview ? [{ photo: preview.collection.photos[preview.photoIndex], collectionId: preview.collection.id }] : []
    const entrances = panel.kind === 'index'
      ? tabCollections.map((item) => ({ photo: item.photos[0], collectionId: item.id })) : []
    // Prepare destinations while the visitor is deciding, without loading a
    // whole work. ExhibitionImage retains at most six decoded image nodes.
    return [...intended, ...entrances, ...adjacent]
  }, [sequence, collection?.id, photo?.id, panel, preview, tabCollections])
  const hasPrevious = photoIndex > 0 || collectionIndex > 0
  const hasNext = !!collection && (photoIndex < collection.photos.length - 1 || collectionIndex < sectionCollections.length - 1)

  useExhibitionCursor(stageRef, cursorRef, shownCollection?.id, panel !== null)

  const selectPhoto = useCallback((nextCollection: ExhibitionCollection, index: number) => {
    const nextPhoto = nextCollection.photos[index]
    if (!nextPhoto) return
    const nextHash = photoHash(nextCollection.id, nextPhoto.id)
    if (window.location.hash !== nextHash) { window.history.pushState(window.history.state, '', nextHash); window.dispatchEvent(new HashChangeEvent('hashchange')) }
  }, [])

  const step = useCallback((direction: number) => {
    if (!collection || panel) return
    const nextIndex = photoIndex + direction
    if (nextIndex >= 0 && nextIndex < collection.photos.length) return selectPhoto(collection, nextIndex)
    const nextCollection = sectionCollections[collectionIndex + direction]
    if (nextCollection) selectPhoto(nextCollection, direction > 0 ? 0 : nextCollection.photos.length - 1)
  }, [collection, panel, photoIndex, selectPhoto, sectionCollections, collectionIndex])

  const onPresent = useCallback((collectionId: string, photoId: string) => {
    const nextCollection = availableCollections.find((item) => item.id === collectionId)
    const nextIndex = nextCollection?.photos.findIndex((item) => item.id === photoId) ?? -1
    if (nextCollection && nextIndex >= 0) {
      setPresented((current) => current?.decoded && current.collection.id === collectionId && current.photoIndex === nextIndex
        ? current : { collection: nextCollection, photoIndex: nextIndex, decoded: true })
    }
  }, [availableCollections])

  const openPanel = useCallback((kind: Panel['kind'], initialTab: Section) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (tabTimer.current) clearTimeout(tabTimer.current)
    setTab({ active: initialTab, displayed: initialTab, fading: false })
    setPreview(null)
    setPanel({ kind, phase: 'entering' })
  }, [])

  // Safari does not focus buttons on click, so Modal would otherwise record
  // <body> and leave nowhere to return focus when the panel closes.
  const openPanelFrom = (event: ReactMouseEvent<HTMLButtonElement>, kind: Panel['kind']) => {
    event.currentTarget.focus({ preventScroll: true })
    openPanel(kind, section)
  }
  const preparePhoto = (nextCollection: ExhibitionCollection, index: number) => {
    setPreview((current) => current?.collection.id === nextCollection.id && current.photoIndex === index
      ? current : { collection: nextCollection, photoIndex: index })
  }
  const closePanel = useCallback(() => {
    if (!panel || panel.phase === 'closing') return
    if (window.location.hash === '#travels' && collection && photo) {
      window.history.replaceState(window.history.state, '', photoHash(collection.id, photo.id))
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    }
    setPanel({ ...panel, phase: 'closing' })
    closeTimer.current = setTimeout(() => setPanel(null), TRANSITION_MS)
  }, [panel, collection, photo])
  const changeTab = (next: IndexTab) => {
    if (tabTimer.current) clearTimeout(tabTimer.current)
    setTab((current) => ({ ...current, active: next, fading: true }))
    tabTimer.current = setTimeout(() => setTab({ active: next, displayed: next, fading: false }), 300)
  }

  // The server cannot read the fragment. Open the directory only after its
  // first photograph has decoded, so the drawer never opens over the SSR cover.
  useLayoutEffect(() => {
    if (hash !== '#travels' || !presented?.decoded || presented.collection !== collection || presented.photoIndex !== 0) return
    const frame = requestAnimationFrame(() => {
      if (window.location.hash !== '#travels') return
      indexTrigger.current?.focus({ preventScroll: true })
      openPanel('index', 'travels')
    })
    return () => cancelAnimationFrame(frame)
  }, [hash, collection, presented, openPanel])

  useEffect(() => {
    const restoreHistoryPanel = () => {
      if (window.location.hash !== '#travels') {
        if (closeTimer.current) clearTimeout(closeTimer.current)
        setPanel(null)
      }
    }
    window.addEventListener('popstate', restoreHistoryPanel)
    return () => window.removeEventListener('popstate', restoreHistoryPanel)
  }, [])

  useLayoutEffect(() => {
    const stage = stageRef.current
    const captions = captionsRef.current
    if (travelLayout !== 'portrait' || !stage || !captions) return

    // All captions share one grid cell. A narrower photo can add a line of text,
    // so measure again at each new width until both fit at the largest size.
    const fit = () => {
      stage.style.removeProperty('--fitted-width')
      stage.style.removeProperty('--caption-width')
      const layout = getComputedStyle(stage)
      const available = stage.clientHeight - parseFloat(layout.paddingTop) - parseFloat(layout.paddingBottom)
      const gap = parseFloat(layout.rowGap)
      const maxWidth = captions.getBoundingClientRect().width
      let width = maxWidth
      while (width > 1) {
        const room = available - gap - captions.getBoundingClientRect().height
        if (width / ratio <= room + 0.5) break
        const next = Math.floor(room * ratio)
        if (next < 1) {
          // On very short landscape screens no equal-width column may fit:
          // narrowing it again produces more lines than the entire viewport.
          stage.style.setProperty('--caption-width', 'var(--photo-width)')
          const remaining = available - gap - captions.getBoundingClientRect().height
          const photoWidth = Math.max(1, Math.min(maxWidth, Math.floor(remaining * ratio)))
          stage.style.setProperty('--fitted-width', `${photoWidth}px`)
          break
        }
        stage.style.setProperty('--fitted-width', `${next}px`)
        width = next
      }
      stage.style.setProperty('--caption-height', `${captions.getBoundingClientRect().height}px`)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(stage)
    document.fonts.addEventListener('loadingdone', fit)
    return () => {
      observer.disconnect()
      document.fonts.removeEventListener('loadingdone', fit)
      stage.style.removeProperty('--fitted-width')
      stage.style.removeProperty('--caption-height')
      stage.style.removeProperty('--caption-width')
    }
  }, [travelLayout, shownCollection, ratio])

  useLayoutEffect(() => {
    if (travelLayout !== 'landscape' || !stageRef.current || !captionsRef.current || !controlsRef.current || !positionRef.current) return
    return observeLandscapeCaption(stageRef.current, captionsRef.current, controlsRef.current, positionRef.current, ratio)
  }, [travelLayout, shownPhoto, ratio])

  useEffect(() => {
    if (panel?.phase !== 'entering') return
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => setPanel((current) => current?.phase === 'entering' ? { ...current, phase: 'open' } : current)) })
    return () => cancelAnimationFrame(frame)
  }, [panel])
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); if (tabTimer.current) clearTimeout(tabTimer.current) }, [])
  useEffect(() => {
    if (!collection || !photo || window.location.hash !== hash) return
    const canonical = photoHash(collection.id, photo.id)
    if (hash && !(collection.section === 'travels' && hash.startsWith(`#${collection.id}/`) && hash !== canonical)) return
    window.history.replaceState(window.history.state, '', photoHash(collection.id, photo.id))
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }, [collection, photo, hash])
  useEffect(() => {
    const skipLink = document.querySelector<HTMLAnchorElement>('a.skip-link[href="#main-content"]')
    const focusExhibition = (event: MouseEvent) => { event.preventDefault(); document.getElementById('main-content')?.focus({ preventScroll: true }) }
    skipLink?.addEventListener('click', focusExhibition)
    return () => skipLink?.removeEventListener('click', focusExhibition)
  }, [])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (panel || event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); step(event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [panel, step])

  if (!collection || !photo || !shownCollection) return <main lang="en" className={styles.exhibition}><Link href="/">Back to Zhlin</Link><p>No photographs are available.</p></main>
  const portraitStyle = travelLayout === 'portrait' ? { '--stage-ratio': ratio } as CSSProperties : undefined
  const captionPhotos = travelLayout === 'landscape' && shownPhoto ? [shownPhoto] : shownCollection.photos
  const label = `${shownCollection.title} - ${shownIndex + 1}/${shownCollection.photos.length}`

  return (
    <main lang="en" className={styles.exhibition} aria-label="Photography exhibition" data-exhibition-collection={shownCollection.id} data-travel={isTravel} data-index-open={panel?.kind === 'index' && panel.phase !== 'closing'}>
      <h1 className={styles.srOnly}>{shownCollection.title} — Photography by Zhlin</h1>
      <div ref={stageRef} className={styles.stage} style={portraitStyle} data-travel-layout={travelLayout} data-testid="exhibition-stage" data-exhibition-surface
        onTouchStart={(event) => { const touch = event.touches[0]; touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null }}
        onTouchEnd={(event) => {
          const start = touchStart.current
          touchStart.current = null
          const end = event.changedTouches[0]
          if (!start || !end) return
          const dx = start.x - end.clientX
          const dy = start.y - end.clientY
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.25) { suppressClickUntil.current = Date.now() + 500; step(dx > 0 ? 1 : -1) }
        }}
        onTouchCancel={() => { touchStart.current = null }}
      >
        <div className={styles.photoSurface}>
          <ExhibitionImage photo={photo} collectionId={collection.id} neighbours={neighbours} locationHash={hash} onPresent={onPresent} />
          <button type="button" className={`${styles.clickZone} ${styles.previousZone}`} tabIndex={-1} aria-hidden="true" disabled={!hasPrevious} onClick={() => { if (Date.now() > suppressClickUntil.current) step(-1) }} />
          <button type="button" className={`${styles.clickZone} ${styles.nextZone}`} tabIndex={-1} aria-hidden="true" disabled={!hasNext} onClick={() => { if (Date.now() > suppressClickUntil.current) step(1) }} />
        </div>
        {isTravel && <div ref={captionsRef} className={travelLayout === 'landscape' ? styles.landscapeFrame : styles.captions} lang="zh-CN">
          {captionPhotos.map(({ id, caption }) => caption && (
            <article key={id} className={styles.caption} aria-hidden={id !== shownPhoto?.id}>
              <p className={styles.eyebrow}>{caption.place}</p>
              <p className={styles.body}>{caption.body}</p>
            </article>
          ))}
        </div>}
      </div>
      <div ref={cursorRef} className={styles.cursorLabel} data-testid="exhibition-cursor" data-visible="false" data-size="large" aria-hidden="true">{label}</div>
      <p ref={positionRef} className={styles.position} aria-live="polite" aria-atomic="true" data-testid="exhibition-position">{label}</p>
      <nav ref={controlsRef} className={styles.viewNavigation} aria-label="Exhibition views" data-testid="exhibition-controls">
        <button type="button" aria-haspopup="dialog" aria-expanded={panel?.kind === 'index'} ref={indexTrigger} onClick={(event) => openPanelFrom(event, 'index')}>Index</button><span className={styles.divider} aria-hidden="true" /><button type="button" aria-haspopup="dialog" aria-expanded={panel?.kind === 'thumbs'} onClick={(event) => openPanelFrom(event, 'thumbs')}>Thumbs</button>
      </nav>
      <div className={styles.keyboardNavigation}><button type="button" aria-label="Previous photograph" disabled={!hasPrevious} onClick={() => step(-1)}>← Previous</button><button type="button" aria-label="Next photograph" disabled={!hasNext} onClick={() => step(1)}>Next →</button></div>
      <Modal isOpen={panel !== null} onClose={closePanel} className={`${styles.overlay} ${panel?.kind === 'thumbs' ? styles.thumbsOverlay : ''} ${panel?.phase === 'open' ? styles.overlayOpen : ''}`} ariaLabel={panel?.kind === 'index' ? 'Index' : `${shownCollection.title} — Thumbs`} initialFocusRef={closeButtonRef}>
        <section lang="en" className={panel?.kind === 'index' ? styles.indexPanel : styles.thumbsPanel} data-testid="exhibition-panel" data-state={panel?.phase}>
          {panel?.kind === 'index' ? <>
            <header className={styles.panelHeader}>
              <div className={styles.indexTabs} role="tablist" aria-label="Photography index" onKeyDown={(event) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
                event.preventDefault()
                const direction = event.key === 'ArrowRight' ? 1 : -1
                const adjacent = (indexTabs.indexOf(tab.active) + direction + indexTabs.length) % indexTabs.length
                const next = event.key === 'Home' ? 'works' : event.key === 'End' ? 'info' : indexTabs[adjacent]
                changeTab(next)
                tabRefs.current[next]?.focus()
              }}>
                {indexTabs.map(name => <button key={name} ref={node => { tabRefs.current[name] = node }}
                  type="button" role="tab" id={`exhibition-${name}-tab`} aria-controls={`exhibition-${name}-panel`}
                  aria-selected={tab.active === name} tabIndex={tab.active === name ? 0 : -1}
                  onClick={() => changeTab(name)}>{name[0].toUpperCase() + name.slice(1)}</button>)}
              </div>
              <Link href="/" aria-label="Zhlin home" className={styles.homeLink}>Home</Link>
              <button ref={closeButtonRef} type="button" aria-label="Close index" className={styles.closeButton} onClick={closePanel}>Close</button>
            </header>
            <div className={styles.indexContent} data-fading={tab.fading}>
              {(['works', 'travels'] as const).map(name => (
                <div key={name} role="tabpanel" id={`exhibition-${name}-panel`} aria-labelledby={`exhibition-${name}-tab`} hidden={tab.displayed !== name}>
                  {tab.displayed === name && <div className={styles.collectionList}>
                    {tabCollections.map(item => {
                      const destination = name === 'works' && item.id === shownCollection.id ? shownIndex : 0
                      const prepare = () => preparePhoto(item, destination)
                      return <button type="button" key={item.id} className={styles.collectionButton} aria-current={item.id === shownCollection.id ? 'true' : undefined}
                        onMouseEnter={prepare} onFocus={prepare} onTouchStart={prepare}
                        onClick={() => { selectPhoto(item, destination); closePanel() }}>
                        <span>{item.title}</span><span className={styles.collectionCount}>{item.photos.length}</span>
                      </button>
                    })}
                  </div>}
                </div>
              ))}
              <div role="tabpanel" id="exhibition-info-panel" aria-labelledby="exhibition-info-tab" hidden={tab.displayed !== 'info'} className={styles.infoContent}>{tab.displayed === 'info' ? <><h2>{profile.name}</h2><p>Photographer<br />{profile.city}</p>{shownCollection.description ? <p lang={/[\u3400-\u9fff]/.test(shownCollection.description) ? 'zh-CN' : 'en'}>{shownCollection.description}</p> : null}<p><a href={`mailto:${profile.email}`}>{profile.email}</a></p></> : null}</div>
            </div>
          </> : <>
            <header className={styles.thumbsHeader}><h2>{shownCollection.title}</h2><button ref={closeButtonRef} type="button" aria-label="Close thumbnails" onClick={closePanel}>Close</button></header>
            <div className={styles.thumbnailGrid}>{shownCollection.photos.map((item, index) => <button type="button" key={item.id} className={styles.thumbnailButton} aria-label={`View photograph ${index + 1}: ${item.alt}`} aria-current={index === shownIndex ? 'true' : undefined}
              onMouseEnter={() => preparePhoto(shownCollection, index)} onFocus={() => preparePhoto(shownCollection, index)} onTouchStart={() => preparePhoto(shownCollection, index)}
              onClick={() => { selectPhoto(shownCollection, index); closePanel() }}><span className={styles.thumbnailImage}><Image src={item.thumbnail} alt="" width={item.width} height={item.height} sizes="(max-width: 480px) 18vw, (max-width: 991px) 16vw, 8vw" /></span><span className={styles.srOnly}>{index + 1}</span></button>)}</div>
          </>}
        </section>
      </Modal>
    </main>
  )
}
