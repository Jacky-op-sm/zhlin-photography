import works from '../../../content/photography/photos/works.json'
import intersection from '../../../content/photography/photos/intersection.json'
import village from '../../../content/photography/photos/miaoqiantan.json'
import villageColor from '../../../content/photography/photos/miaoqiantan-color.json'
import bangkok from '../../../content/photography/photos/bangkok.json'
import series from '../../../content/photography/series.json'
import { photoRecordsSchema, photographySeriesListSchema } from './schemas'
import type { ExhibitionCollection, ExhibitionPhoto } from '@/components/photography/PhotographyExhibition'

function exhibitionPhotos(records: unknown): ExhibitionPhoto[] {
  return photoRecordsSchema.parse(records).map(photo => ({
    id: photo.id, alt: photo.title, src: photo.filename, thumbnail: photo.thumbnail,
    width: photo.width, height: photo.height, legacyHash: photo.legacyHash,
  }))
}

const records = { works, intersection, miaoqiantan: village, bangkok }

export const curatedExhibitions: ExhibitionCollection[] = photographySeriesListSchema.parse(series).flatMap(series => {
  const photos = exhibitionPhotos(records[series.slug])
  const collection: ExhibitionCollection = {
    id: series.slug, section: series.section, title: series.title, description: series.description, photos,
  }
  if (series.brightnessOrder) {
    collection.viewType = 'order'
    const byId = new Map(photos.map(photo => [photo.id, photo]))
    const ordered = series.brightnessOrder.map(id => {
      const photo = byId.get(id)
      if (!photo) throw new Error(`Unknown photograph in brightness order: ${id}`)
      return photo
    })
    return [{ ...collection, viewLabel: '拍摄时间' },
      { ...collection, id: `${series.slug}/light`, baseId: series.slug, viewLabel: '由亮到暗', photos: ordered }]
  }
  if (series.slug === 'miaoqiantan') {
    collection.viewType = 'color'
    return [{ ...collection, viewLabel: '黑白' },
      { ...collection, id: 'miaoqiantan/color', baseId: series.slug, viewLabel: '彩色', photos: exhibitionPhotos(villageColor) }]
  }
  return [collection]
})
