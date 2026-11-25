// Range measures the text itself, excluding button padding and paragraph leading.
function textBounds(element: Element) {
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect()
}

export function observeLandscapeCaption(
  stage: HTMLElement,
  frame: HTMLElement,
  controls: HTMLElement,
  counter: HTMLElement,
  ratio: number,
) {
  const caption = frame.firstElementChild
  const body = caption?.lastElementChild
  const place = caption?.firstElementChild
  const index = controls.firstElementChild
  if (!caption || !body || !place || !index) return

  function reset() {
    stage.style.removeProperty('--landscape-width')
    stage.style.removeProperty('--landscape-top')
    stage.style.removeProperty('--landscape-translate-y')
    frame.style.removeProperty('--caption-scale')
    delete stage.dataset.wideCaption
  }

  const fit = () => {
    reset()
    const region = stage.getBoundingClientRect()
    const initial = frame.getBoundingClientRect()
    const nav = controls.getBoundingClientRect()
    const navAtTop = nav.top < region.top + region.height / 2
    const topLimit = navAtTop ? nav.bottom + 16 : region.top + 40
    const counterVisible = counter.getBoundingClientRect().height > 1
    const bottomLimit = navAtTop
      ? (counterVisible ? textBounds(counter).top : region.bottom) - 20
      : textBounds(index).top - 24
    const lastLineBottom = () => textBounds(body.textContent ? body : place).bottom
    const overflow = lastLineBottom() - bottomLimit
    if (overflow <= 0) return

    const shift = Math.min(overflow, Math.max(0, initial.top - topLimit))
    if (overflow <= shift) {
      stage.style.setProperty('--landscape-top', `calc(50% - ${shift}px)`)
      return
    }

    // A narrower column can gain lines. At each step the current caption
    // height gives an upper bound on every remaining equal-width solution.
    stage.style.setProperty('--landscape-top', `${topLimit - region.top}px`)
    stage.style.setProperty('--landscape-translate-y', '0px')
    const fullWidthExcess = lastLineBottom() - bottomLimit
    const widthWithOriginalCaption = Math.floor(initial.width - fullWidthExcess * ratio)
    let width = widthWithOriginalCaption
    while (width >= 1) {
      stage.style.setProperty('--landscape-width', `${width}px`)
      const excess = lastLineBottom() - bottomLimit
      if (excess <= 0) return
      width = Math.floor(width - excess * ratio)
    }

    // If no equal-width combination fits, keep the original text column.
    // Its line breaks are now independent of the remaining photo height.
    stage.dataset.wideCaption = ''
    if (widthWithOriginalCaption >= 1) {
      stage.style.setProperty('--landscape-width', `${widthWithOriginalCaption}px`)
      return
    }

    // Even the caption alone is too tall. At a fixed column width, scaling
    // both type and photo down can only reduce the total height.
    const scaleBoth = (scale: number) => {
      frame.style.setProperty('--caption-scale', String(scale))
      stage.style.setProperty('--landscape-width', `${initial.width * scale}px`)
    }
    let fits = 0
    let tooTall = 1
    while (tooTall - fits > 0.001) {
      const scale = (fits + tooTall) / 2
      scaleBoth(scale)
      if (lastLineBottom() <= bottomLimit) fits = scale
      else tooTall = scale
    }
    scaleBoth(fits)
  }

  fit()
  const observer = new ResizeObserver(fit)
  for (const element of [stage, controls, counter, body]) observer.observe(element)
  document.fonts.addEventListener('loadingdone', fit)
  return () => {
    observer.disconnect()
    document.fonts.removeEventListener('loadingdone', fit)
    reset()
  }
}
