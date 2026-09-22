import streetPhotos from '../../../content/photography/photos/street.json';
import petsPhotos from '../../../content/photography/photos/pets.json';
import projectPhotos from '../../../content/photography/photos/project.json';
import series from '../../../content/photography/series.json';
import {
  photoRecordsSchema,
  photographySeriesListSchema,
  type PhotographySeriesContent,
} from '@/lib/content/schemas';
import { PhotoCategory, type Photo } from '@/lib/types';

const photoContent = {
  street: photoRecordsSchema.parse(streetPhotos),
  pets: photoRecordsSchema.parse(petsPhotos),
  project: photoRecordsSchema.parse(projectPhotos),
} satisfies Record<PhotographySeriesContent['slug'], unknown>

export const photographyPhotos: Photo[] = Object.entries(photoContent).flatMap(
  ([category, photos]) =>
    photos.map((photo) => ({
      ...photo,
      category: category as PhotoCategory,
    })),
)

export const photographySeriesContent = photographySeriesListSchema.parse(series);
