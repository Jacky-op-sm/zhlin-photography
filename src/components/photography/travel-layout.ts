// Travel frames are placed by a pure function of the viewport and the frame
// itself. Nothing here reads the photograph or caption currently on screen, so
// a frame lands in the same place however the visitor reached it.

export type TravelCaption = { place: string; body: string }
export type TravelOrientation = 'landscape' | 'portrait'
export interface TravelPlacement {
  photo: { x: number; y: number; width: number; height: number }
  caption: { x: number; y: number; width: number; scale: number }
  /** How far a landscape frame rose above its Works position, before any shrinking. */
  shift: number
  /** The photograph is narrower than the Works frame for this orientation. */
  reduced: boolean
}

export interface TravelLayoutElements {
  stage: HTMLElement
  controls: HTMLElement
  counter: HTMLElement
  index: HTMLElement
  /** Hidden `.imageLayer` probes: the exact Works frames for each orientation. */
  landscapeProbe: HTMLElement
  portraitProbe: HTMLElement
  /** Hidden box spanning the Works photo band (`--photo-width` × `--photo-height`). */
  bandProbe: HTMLElement
  /** Hidden caption with the live caption's classes, typeset at any width. */
  measurer: HTMLElement
}

type Rect = { x: number; y: number; width: number; height: number }
export interface TravelBounds {
  width: number
  /** Highest allowed photo top. */
  top: number
  /** Lowest allowed caption bottom. */
  bottom: number
  works: Record<TravelOrientation, Rect>
  band: Rect
}

const GAP = 16
const LANDSCAPE = 5 / 4
const PORTRAIT = 4 / 5

function textTop(element: Element) {
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect().top
}

export function measureTravelBounds(elements: TravelLayoutElements): TravelBounds {
  const stage = elements.stage.getBoundingClientRect()
  const relative = (element: Element): Rect => {
    const box = element.getBoundingClientRect()
    return { x: box.left - stage.left, y: box.top - stage.top, width: box.width, height: box.height }
  }
  const controls = relative(elements.controls)
  const counter = relative(elements.counter)
  // Phones and narrow windows carry Index — Thumbs at the top; desktops at the bottom.
  const navAtTop = controls.y < stage.height / 2
  const top = navAtTop ? controls.y + controls.height + 16 : 40
  const bottom = counter.height > 1 ? counter.y - 20
    : navAtTop ? stage.height - 20
      : textTop(elements.index) - stage.top - 24
  return {
    width: stage.width,
    top,
    bottom,
    works: { landscape: relative(elements.landscapeProbe), portrait: relative(elements.portraitProbe) },
    band: relative(elements.bandProbe),
  }
}

export function createCaptionMeasure(measurer: HTMLElement) {
  const article = measurer.firstElementChild as HTMLElement
  const [place, body] = Array.from(article.children) as HTMLElement[]
  return (caption: TravelCaption, orientation: TravelOrientation, width: number, scale = 1) => {
    measurer.dataset.orientation = orientation
    measurer.style.width = `${width}px`
    measurer.style.setProperty('--caption-scale', String(scale))
    if (place.textContent !== caption.place) place.textContent = caption.place
    if (body.textContent !== caption.body) body.textContent = caption.body
    return article.getBoundingClientRect().height
  }
}
export type CaptionMeasure = ReturnType<typeof createCaptionMeasure>

/**
 * Landscape: start from the Works frame R and rise by exactly the caption's
 * overflow, max(0, R.bottom + 16 + H − B). If that would cross the top line T,
 * pin the photo to T and shrink it at 5:4 until T + height + 16 + H(width) ≤ B.
 */
export function placeLandscape(bounds: TravelBounds, caption: TravelCaption, measure: CaptionMeasure): TravelPlacement {
  const works = bounds.works.landscape
  const fullHeight = measure(caption, 'landscape', works.width)
  const shift = Math.max(0, works.y + works.height + GAP + fullHeight - bounds.bottom)
  const place = (x: number, y: number, width: number, captionX = x, captionWidth = width, scale = 1): TravelPlacement => ({
    photo: { x, y, width, height: width / LANDSCAPE },
    caption: { x: captionX, y: y + width / LANDSCAPE + GAP, width: captionWidth, scale },
    shift,
    reduced: width < works.width - 0.5,
  })
  if (works.y - shift >= bounds.top) return place(works.x, works.y - shift, works.width)

  // Each step can only add caption lines, so every width between two steps is
  // too tall as well: the first width that fits is the largest one that fits.
  const room = bounds.bottom - bounds.top - GAP
  let width = works.width
  let height = fullHeight
  for (;;) {
    const next = Math.floor((room - height) * LANDSCAPE)
    if (next < 1) break
    width = Math.min(next, width - 1)
    height = measure(caption, 'landscape', width)
    if (width / LANDSCAPE + height <= room + 0.5) return place((bounds.width - width) / 2, bounds.top, width)
  }

  // Very short screens: keep the Works text column and shrink only the photo.
  const besideWidth = Math.floor((room - fullHeight) * LANDSCAPE)
  if (besideWidth >= 1) return place(works.x, bounds.top, besideWidth, works.x, works.width)
  // Even the caption alone is too tall: scale type and photo together.
  let fits = 0
  let tooTall = 1
  while (tooTall - fits > 0.001) {
    const scale = (fits + tooTall) / 2
    if (works.width * scale / LANDSCAPE + measure(caption, 'landscape', works.width, scale) <= room) fits = scale
    else tooTall = scale
  }
  return place(works.x, bounds.top, works.width * fits, works.x, works.width, fits)
}

/**
 * Portrait: the series reserves room for its longest caption block (place,
 * 6px, body) typeset at the photo's own width. Photo, gap and reserved block
 * are centred together in the Works band and the photo shrinks until all of it
 * fits between T and B.
 */
export function placePortrait(bounds: TravelBounds, series: TravelCaption[], measure: CaptionMeasure): TravelPlacement {
  const works = bounds.works.portrait
  const bandTop = Math.max(bounds.band.y, bounds.top)
  const bandBottom = Math.min(bounds.band.y + bounds.band.height, bounds.bottom)
  const room = bandBottom - bandTop - GAP
  const reserved = (width: number) => series.reduce((tallest, caption) => Math.max(tallest, measure(caption, 'portrait', width)), 0)

  let width = works.width
  let captionWidth = width
  let height = reserved(width)
  while (width / PORTRAIT + height > room + 0.5) {
    const next = Math.floor((room - height) * PORTRAIT)
    if (next < 1) {
      // On very short landscape screens no equal-width column fits; use the
      // whole photo band for the text and give the photo what remains.
      captionWidth = bounds.band.width
      height = reserved(captionWidth)
      width = Math.max(1, Math.min(works.width, Math.floor((room - height) * PORTRAIT)))
      break
    }
    width = Math.min(next, width - 1)
    captionWidth = width
    height = reserved(width)
  }

  const total = width / PORTRAIT + GAP + height
  const centred = bounds.band.y + (bounds.band.height - total) / 2
  const y = Math.max(bandTop, Math.min(centred, bandBottom - total))
  return {
    photo: { x: (bounds.width - width) / 2, y, width, height: width / PORTRAIT },
    caption: { x: (bounds.width - captionWidth) / 2, y: y + width / PORTRAIT + GAP, width: captionWidth, scale: 1 },
    shift: 0,
    reduced: width < works.width - 0.5,
  }
}
