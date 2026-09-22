import path from 'node:path'

export const projectRoot = process.cwd()
export const publicRoot = path.join(projectRoot, 'public')
export const photographyOriginalRoot = path.join(
  publicRoot,
  'assets',
  'photos',
)
export const generatedRoot = path.join(
  publicRoot,
  'assets',
  'generated',
  'photos',
)
export const photographyContentRoot = path.join(
  projectRoot,
  'content',
  'photography',
  'photos',
)
export const manifestPath = path.join(
  projectRoot,
  'content',
  'photography',
  'image-manifest.json',
)

export const imageFormat = 'webp'
export const imageProfiles = {
  thumbnail: {
    suffix: 'thumb',
    maxEdge: 640,
    quality: 76,
  },
  large: {
    suffix: 'large',
    maxEdge: 2400,
    quality: 84,
  },
}

export const publicAssetBudget = {
  totalMb: 170,
  fileMb: 1.8,
}
export const publicImageHardLimitBytes = Math.round(
  publicAssetBudget.fileMb * 1024 * 1024,
)

function assertSeries(series) {
  if (!/^[a-z0-9-]+$/.test(series)) {
    throw new Error(`Invalid photography series: ${series}`)
  }
}

export function getPhotographySeriesPaths(series) {
  assertSeries(series)
  const originalDir = path.join(photographyOriginalRoot, series)

  return {
    contentPath: path.join(photographyContentRoot, `${series}.json`),
    originalDir,
    originalPublicPath: toPublicPath(originalDir),
    generatedDir: path.join(generatedRoot, series),
  }
}

export function getGeneratedVariantPaths(series, source) {
  const { generatedDir } = getPhotographySeriesPaths(series)
  const baseName = path.parse(source).name

  return Object.fromEntries(
    Object.entries(imageProfiles).map(([name, profile]) => [
      name,
      path.join(generatedDir, `${baseName}-${profile.suffix}.${imageFormat}`),
    ]),
  )
}

export function toPublicPath(absolutePath) {
  return `/${path
    .relative(publicRoot, absolutePath)
    .split(path.sep)
    .join('/')}`
}

export function fromPublicPath(publicPath) {
  const absolutePath = path.resolve(publicRoot, publicPath.replace(/^\/+/, ''))
  const relativePath = path.relative(publicRoot, absolutePath)
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Public path escapes public/: ${publicPath}`)
  }
  return absolutePath
}

export function resolveSourcePath(source) {
  if (source.startsWith('/')) return fromPublicPath(source)

  const absolutePath = path.resolve(projectRoot, source)
  const relativePath = path.relative(projectRoot, absolutePath)
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Source path escapes the project: ${source}`)
  }
  return absolutePath
}
