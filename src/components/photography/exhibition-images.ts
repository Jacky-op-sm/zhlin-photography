export const TRANSITION_MS = 1000

// Match the imageLayer dimensions and object-fit: contain in
// PhotographyExhibition.module.css without changing the rendered photograph.
export function getExhibitionImageSizes(photo: { width: number; height: number }) {
  const aspectRatio = photo.width / photo.height
  const scaled = (value: number) => Number((value * aspectRatio).toFixed(6))
  const containedWidth = (width: string, verticalSpace: number) =>
    `min(${width}, max(${scaled(120)}px, calc(${scaled(100)}dvh - ${scaled(verticalSpace)}px)))`
  const desktopWidth = photo.width > photo.height ? '58.333333vw' : '41.666667vw'
  const mobileWidth = 'calc(100vw - 40px)'

  return [
    `(max-width: 960px) and (max-height: 500px) ${containedWidth(mobileWidth, 100)}`,
    `(max-height: 500px) ${containedWidth(desktopWidth, 100)}`,
    `(max-width: 960px) ${containedWidth(mobileWidth, 160)}`,
    containedWidth(desktopWidth, 200),
  ].join(', ')
}
