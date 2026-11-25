export const TRANSITION_MS = 1000

export function cropRatio(photo: { width: number; height: number }) {
  return photo.width >= photo.height ? 5 / 4 : 4 / 5
}

// With cover, wide originals extend beyond the sides of the visible frame.
// Request enough source pixels for that full painted width at the device DPR.
export function getExhibitionImageSizes(photo: { width: number; height: number }) {
  const ratio = cropRatio(photo)
  const paintedRatio = Math.max(ratio, photo.width / photo.height)
  const overscan = paintedRatio / ratio
  const rounded = (value: number) => Number(value.toFixed(6))
  const heightLimit = (inset: number) =>
    `calc(${rounded(100 * paintedRatio)}dvh - ${rounded(inset * paintedRatio)}px)`

  return [
    `(max-width: 960px) min(calc(${rounded(100 * overscan)}vw - ${rounded(40 * overscan)}px), ${heightLimit(160)})`,
    `min(${rounded(100 * 10 / 24 * overscan)}vw, ${heightLimit(200)})`,
  ].join(', ')
}
