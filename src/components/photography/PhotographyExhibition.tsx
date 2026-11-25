'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import { flushSync } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import Modal from '@/components/ui/Modal'
import profile from '../../../content/site/profile.json'
import { ExhibitionImage, useExhibitionCursor, TRANSITION_MS } from './ExhibitionPresentation'
import { targetKey, type Target } from './ExhibitionImage'
import { cropRatio } from './exhibition-images'
import { createCaptionMeasure, measureTravelBounds, placeLandscape, placePortrait, type CaptionMeasure, type TravelBounds, type TravelPlacement } from './travel-layout'
import styles from './PhotographyExhibition.module.css'

type Caption = { place: string; eyebrow: string; title: string; body: string }
const sections = ['works', 'travels'] as const
type Section = (typeof sections)[number]
const indexTabs = [...sections, 'info'] as const
type IndexTab = (typeof indexTabs)[number]

export interface ExhibitionPhoto { legacyHash?: string; focus?: string; caption?: Caption; id: string; src: string; thumbnail: string; width: number; height: number; alt: string }
export interface ExhibitionCollection { baseId?: string; viewLabel?: string; viewType?: 'order' | 'color'; section?: Section; id: string; title: string; description?: string; photos: ExhibitionPhoto[] }
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
function placementKey({ collection, photoIndex }: Selection) {
  const photo = collection.photos[photoIndex]
  // Every portrait frame of a series shares one reserved caption block.
  return cropRatio(photo) > 1 ? `${collection.id}/${photo.id}` : `${collection.id}/portrait`
}
function placeFrame(bounds: TravelBounds, { collection, photoIndex }: Selection, measure: CaptionMeasure) {
  const photo = collection.photos[photoIndex]
  if (cropRatio(photo) > 1) return placeLandscape(bounds, photo.caption ?? { place: '', body: '' }, measure)
  return placePortrait(bounds, collection.photos.flatMap(entry => entry.caption ? [entry.caption] : []), measure)
}
function directorySection(hash: string) {
  // The projects now sit in Works; earlier #projects links open that index.
  return hash === '#projects' ? 'works' : hash === '#travels' ? 'travels' : null
}
function resolveSelection(hash: string, collections: ExhibitionCollection[], initialId?: string): Selection | null {
  const fallback = collections.find((collection) => collection.id === initialId) ?? collections[0]
  if (!fallback) return null
  try {
    const parts = hash.slice(1).split('/').map(decodeURIComponent)
    const directory = directorySection(hash)
    if (directory) return { collection: collections.find(item => item.section === directory) ?? fallback, photoIndex: 0 }
    const photoId = parts.pop()
    const collectionId = parts.join('/')
    const collection = collections.find((item) => item.id === collectionId)
    const photoIndex = collection?.photos.findIndex((photo) => photo.id === photoId) ?? -1
    if (collection && photoIndex >= 0) return { collection, photoIndex }
    // Previously shared links to a retained picture follow it into its new sequence.
    const legacy = parts.concat(photoId ?? '').join('/')
    for (const item of collections) {
      if (item.baseId) continue
      const index = item.photos.findIndex(entry => entry.legacyHash === legacy)
      if (index >= 0) return { collection: item, photoIndex: index }
    }
    const oldSections: Record<string, string> = { street: 'works', pets: 'miaoqiantan', project: 'intersection' }
    const entrance = collection ?? collections.find(item => item.id === (oldSections[collectionId] ?? photoId))
    if (entrance) return { collection: entrance, photoIndex: 0 }
  } catch { /* A malformed or stale photo link opens the default exhibition. */ }
  return { collection: fallback, photoIndex: 0 }
}

export default function PhotographyExhibition({ collections, initialCollectionId }: PhotographyExhibitionProps) {
  const availableCollections = useMemo(() => collections.filter((collection) => collection.photos.length > 0), [collections])
  const hash = useSyncExternalStore(subscribeToLocation, locationSnapshot, serverLocationSnapshot)
  const selection = useMemo(() => resolveSelection(hash, availableCollections, initialCollectionId), [hash, availableCollections, initialCollectionId])
  const [presented, setPresented] = useState(() => selection && { ...selection, decoded: false })
  const [covering, setCovering] = useState<Target | null>(null)
  const [layoutVersion, setLayoutVersion] = useState(0)
  const [layout, setLayout] = useState<{ version: number; placements: Record<string, TravelPlacement> }>({ version: -1, placements: {} })
  const [panel, setPanel] = useState<Panel | null>(null)
  const [preview, setPreview] = useState<Selection | null>(null)
  const [tab, setTab] = useState<{ active: IndexTab; displayed: IndexTab; fading: boolean }>({ active: 'works', displayed: 'works', fading: false })
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const tabRefs = useRef<Partial<Record<IndexTab, HTMLButtonElement | null>>>({})
  const indexTrigger = useRef<HTMLButtonElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const landscapeProbeRef = useRef<HTMLDivElement>(null)
  const portraitProbeRef = useRef<HTMLDivElement>(null)
  const bandProbeRef = useRef<HTMLDivElement>(null)
  const measurerRef = useRef<HTMLDivElement>(null)
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
  const directory = directorySection(hash)
  const shown = directory ? selection : presented ?? selection
  const shownCollection = shown?.collection
  const shownIndex = shown?.photoIndex ?? 0
  const isTravel = shownCollection?.section === 'travels'
  const shownPhoto = shownCollection?.photos[shownIndex]
  const travelLayout = isTravel && shownPhoto ? (cropRatio(shownPhoto) > 1 ? 'landscape' : 'portrait') : undefined
  // While the curtain still shows the outgoing photograph, its caption stays with it.
  const coveringFrame = useMemo(() => {
    const outgoing = covering && availableCollections.find(item => item.id === covering.collectionId)
    const index = outgoing ? outgoing.photos.indexOf(covering.photo) : -1
    return outgoing && index >= 0 ? { collection: outgoing, photoIndex: index } : null
  }, [covering, availableCollections])
  const captionFrame = coveringFrame ?? (shownCollection ? { collection: shownCollection, photoIndex: shownIndex } : null)
  const section = collection?.section ?? 'works'
  // Each project has one index entry even when a visitor chooses its alternate reading.
  const primaryCollections = useMemo(() => availableCollections.filter(item => !item.baseId)
    .map(item => collection?.baseId === item.id ? collection : item), [availableCollections, collection])
  const sectionCollections = useMemo(() => primaryCollections.filter(item => (item.section ?? 'works') === section), [primaryCollections, section])
  const tabCollections = useMemo(() => primaryCollections.filter(item => (item.section ?? 'works') === tab.displayed), [primaryCollections, tab.displayed])
  const viewOptions = useMemo(() => {
    if (!collection?.viewLabel) return []
    const base = collection.baseId ?? collection.id
    return availableCollections.filter(item => (item.baseId ?? item.id) === base)
  }, [availableCollections, collection])
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
    if (directorySection(window.location.hash) && collection && photo) {
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
    if (!directory || !presented?.decoded || presented.collection !== collection || presented.photoIndex !== 0) return
    const frame = requestAnimationFrame(() => {
      if (directorySection(window.location.hash) !== directory) return
      indexTrigger.current?.focus({ preventScroll: true })
      openPanel('index', directory)
    })
    return () => cancelAnimationFrame(frame)
  }, [directory, collection, presented, openPanel])

  useEffect(() => {
    const restoreHistoryPanel = () => {
      if (!directorySection(window.location.hash)) {
        if (closeTimer.current) clearTimeout(closeTimer.current)
        setPanel(null)
      }
    }
    window.addEventListener('popstate', restoreHistoryPanel)
    return () => window.removeEventListener('popstate', restoreHistoryPanel)
  }, [])

  // Each travel frame is placed before it is shown: the requested frame while
  // it decodes, the presented frame, and an outgoing frame under the curtain.
  const placementFrames = useMemo(() => [
    shownCollection && { collection: shownCollection, photoIndex: shownIndex },
    collection && { collection, photoIndex },
    coveringFrame,
  ].filter((frame): frame is Selection => !!frame && frame.collection.section === 'travels'), [shownCollection, shownIndex, collection, photoIndex, coveringFrame])
  useLayoutEffect(() => {
    const current = layout.version === layoutVersion
    const missing = placementFrames.filter(frame => !current || !layout.placements[placementKey(frame)])
    const [stage, controls, counter, index, landscapeProbe, portraitProbe, bandProbe, measurer] = [stageRef.current, controlsRef.current, positionRef.current, indexTrigger.current,
      landscapeProbeRef.current, portraitProbeRef.current, bandProbeRef.current, measurerRef.current]
    if (!missing.length || !stage || !controls || !counter || !index || !landscapeProbe || !portraitProbe || !bandProbe || !measurer) return
    const bounds = measureTravelBounds({ stage, controls, counter, index, landscapeProbe, portraitProbe, bandProbe, measurer })
    const measure = createCaptionMeasure(measurer)
    const placements = current ? { ...layout.placements } : {}
    for (const frame of missing) placements[placementKey(frame)] ??= placeFrame(bounds, frame, measure)
    setLayout({ version: layoutVersion, placements })
  }, [placementFrames, layout, layoutVersion])
  // Viewport, orientation and font changes invalidate every placement at once.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let cancelled = false
    const invalidate = () => { if (!cancelled) flushSync(() => setLayoutVersion(version => version + 1)) }
    const observer = new ResizeObserver(invalidate)
    observer.observe(stage)
    document.fonts.addEventListener('loadingdone', invalidate)
    void document.fonts.ready.then(invalidate)
    return () => {
      cancelled = true
      observer.disconnect()
      document.fonts.removeEventListener('loadingdone', invalidate)
    }
  }, [])
  // The black canvas belongs to this page only. The server HTML selects it by
  // the page marker; once mounted, the root class decides, and this cleanup
  // removes it in the same commit that removes the exhibition.
  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.add(styles.viewerScripted, styles.viewerCanvas)
    return () => root.classList.remove(styles.viewerCanvas)
  }, [])

  useEffect(() => {
    if (panel?.phase !== 'entering') return
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => setPanel((current) => current?.phase === 'entering' ? { ...current, phase: 'open' } : current)) })
    return () => cancelAnimationFrame(frame)
  }, [panel])
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); if (tabTimer.current) clearTimeout(tabTimer.current) }, [])
  useEffect(() => {
    if (!collection || !photo || window.location.hash !== hash) return
    const canonical = photoHash(collection.id, photo.id)
    if (directory || hash === canonical) return
    window.history.replaceState(window.history.state, '', canonical)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }, [collection, photo, hash, directory])
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
  const placementOf = (frame: Selection | null) => frame && layout.version === layoutVersion ? layout.placements[placementKey(frame)] : undefined
  const photoPlacements: Record<string, CSSProperties> = {}
  for (const frame of placementFrames) {
    const placed = placementOf(frame)
    if (placed) photoPlacements[targetKey({ collectionId: frame.collection.id, photo: frame.collection.photos[frame.photoIndex] })] = {
      left: placed.photo.x, top: placed.photo.y, width: placed.photo.width, transform: 'none',
    }
  }
  const captionPhoto = captionFrame?.collection.section === 'travels' ? captionFrame.collection.photos[captionFrame.photoIndex] : undefined
  const captionPlacement = placementOf(captionFrame)
  const captionStyle = captionPlacement ? {
    left: captionPlacement.caption.x, top: captionPlacement.caption.y, width: captionPlacement.caption.width,
    '--caption-scale': captionPlacement.caption.scale,
  } as CSSProperties : { visibility: 'hidden' } as CSSProperties
  const label = `${shownCollection.title} - ${shownIndex + 1}/${shownCollection.photos.length}`

  return (
    <main lang="en" className={styles.exhibition} aria-label="Photography exhibition" data-exhibition-collection={shownCollection.id} data-travel={isTravel}
      data-index-open={panel?.kind === 'index' && panel.phase !== 'closing'} data-thumbs-open={panel?.kind === 'thumbs' && panel.phase !== 'closing'}>
      <h1 className={styles.srOnly}>{shownCollection.title} — Photography by Zhlin</h1>
      <div ref={stageRef} className={styles.stage} data-travel-layout={travelLayout} data-testid="exhibition-stage" data-exhibition-surface
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
          <ExhibitionImage photo={photo} collectionId={collection.id} neighbours={neighbours} locationHash={hash} onPresent={onPresent} placements={photoPlacements} onCover={setCovering} />
          <button type="button" className={`${styles.clickZone} ${styles.previousZone}`} tabIndex={-1} aria-hidden="true" disabled={!hasPrevious} onClick={() => { if (Date.now() > suppressClickUntil.current) step(-1) }} />
          <button type="button" className={`${styles.clickZone} ${styles.nextZone}`} tabIndex={-1} aria-hidden="true" disabled={!hasNext} onClick={() => { if (Date.now() > suppressClickUntil.current) step(1) }} />
        </div>
        {captionPhoto?.caption && <div className={styles.travelCaption} style={captionStyle} lang="zh-CN" data-testid="travel-caption"
          data-orientation={cropRatio(captionPhoto) > 1 ? 'landscape' : 'portrait'}>
          <article key={`${captionFrame?.collection.id}/${captionPhoto.id}`} className={styles.caption}>
            <p className={styles.eyebrow}>{captionPhoto.caption.place}</p>
            <p className={styles.body}>{captionPhoto.caption.body}</p>
          </article>
        </div>}
        {/* Hidden references for travel placement: the Works frames, the Works
            photo band, and a caption typeset off-screen at any width. */}
        <div className={styles.layoutProbes} aria-hidden="true">
          <div ref={landscapeProbeRef} className={styles.imageLayer} data-orientation="landscape" />
          <div ref={portraitProbeRef} className={styles.imageLayer} data-orientation="portrait" />
          <div ref={bandProbeRef} className={styles.bandProbe} />
          <div ref={measurerRef} className={`${styles.travelCaption} ${styles.captionMeasurer}`} lang="zh-CN">
            <article className={styles.caption}><p className={styles.eyebrow} /><p className={styles.body} /></article>
          </div>
        </div>
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
              {sections.map(name => (
                <div key={name} role="tabpanel" id={`exhibition-${name}-panel`} aria-labelledby={`exhibition-${name}-tab`} hidden={tab.displayed !== name}>
                  {tab.displayed === name && <div className={styles.collectionList}>
                    {tabCollections.map(item => {
                      const destination = name !== 'travels' && item.id === shownCollection.id ? shownIndex : 0
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
            <header className={styles.thumbsHeader}><h2>{collection.title}</h2>
              {viewOptions.length > 0 && <div className={styles.viewOptions} role="group" aria-label={collection.viewType === 'order' ? '照片排序' : '照片色调'}>
                {viewOptions.map(option => <button type="button" key={option.id} lang="zh-CN"
                  aria-pressed={collection.id === option.id} onClick={() => {
                    if (collection.id === option.id) return
                    setPreview(null)
                    const page = option.photos.findIndex(entry => entry.id === photo.id)
                    selectPhoto(option, option.viewType === 'color' ? Math.max(0, page) : 0)
                  }}>{option.viewLabel}</button>)}
              </div>}
              <button ref={closeButtonRef} type="button" aria-label="Close thumbnails" onClick={closePanel}>Close</button></header>
            <div className={styles.thumbnailGrid}>{collection.photos.map((item, index) => <button type="button" key={item.id} className={styles.thumbnailButton} aria-label={`View photograph ${index + 1}: ${item.alt}`} aria-current={index === photoIndex ? 'true' : undefined}
              onMouseEnter={() => preparePhoto(collection, index)} onFocus={() => preparePhoto(collection, index)} onTouchStart={() => preparePhoto(collection, index)}
              onClick={() => { selectPhoto(collection, index); closePanel() }}><span className={styles.thumbnailImage}><Image src={item.thumbnail} alt="" width={item.width} height={item.height} sizes="(max-width: 480px) 18vw, (max-width: 991px) 16vw, 8vw" /></span><span className={styles.srOnly}>{index + 1}</span></button>)}</div>
          </>}
        </section>
      </Modal>
    </main>
  )
}
