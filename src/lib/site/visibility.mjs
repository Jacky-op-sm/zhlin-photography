// Public presentation only: turning a section off keeps its source content intact.
export const publicSectionVisibility = {
  '/hobby': false,
}

/** @param {string} href */
export function isPublicPath(href) {
  const pathname = href.split(/[?#]/)[0]
  return Object.entries(publicSectionVisibility).every(
    ([section, visible]) => visible || (pathname !== section && !pathname.startsWith(`${section}/`)),
  )
}
