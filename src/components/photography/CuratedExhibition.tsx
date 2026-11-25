import PhotographyExhibition from './PhotographyExhibition'
import styles from './PhotographyExhibition.module.css'
import { photographyExhibitions } from '@/lib/content/exhibitions'
import { curatedExhibitions } from '@/lib/content/photography'
import type { PhotographySeriesContent } from '@/lib/content/schemas'
import { buildPageMetadata } from '@/lib/site/metadata'

type CollectionId = PhotographySeriesContent['slug']

export function exhibitionMetadata(id: CollectionId) {
  const series = curatedExhibitions.find(collection => collection.id === id)
  if (!series) throw new Error(`Unknown photography collection: ${id}`)
  return buildPageMetadata({
    title: id === 'works' ? 'Works · Photography' : `${series.title} · Photography`,
    description: series.description ?? series.title,
    path: id === 'works' ? '/photography' : `/photography/${id}`,
    image: series.photos[0].src,
  })
}

export function CuratedExhibition({ collectionId }: { collectionId: CollectionId }) {
  return <div className={styles.viewerPage}>
    <PhotographyExhibition collections={photographyExhibitions} initialCollectionId={collectionId} />
  </div>
}
