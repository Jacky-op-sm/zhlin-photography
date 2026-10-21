import PhotographyExhibition from '@/components/photography/PhotographyExhibition'
import { getPhotographySeries } from '@/components/photography/series'
import { photographyExhibitions } from '@/lib/content/exhibitions'
import { buildPageMetadata } from '@/lib/site/metadata'

const series = getPhotographySeries('project')

export const metadata = buildPageMetadata({
  title: series?.title ?? '摄影项目',
  description: series?.landingSummary ?? '长期摄影项目。',
  path: '/photography/project',
  image: series?.cover,
})

export default function ProjectPage() {
  return (
    <PhotographyExhibition collections={photographyExhibitions} initialCollectionId="project" />
  )
}
