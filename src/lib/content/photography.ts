import streetPhotos from '../../../content/photography/photos/street.json';
import petsPhotos from '../../../content/photography/photos/pets.json';
import projectPhotos from '../../../content/photography/photos/project.json';
import projectMeta from '../../../content/photography/project-meta.json';
import series from '../../../content/photography/series.json';
import type { PhotographyPhotoContent, PhotographySeriesContent } from '@/lib/content/types';

export const photographyPhotosContent = {
  street: streetPhotos as PhotographyPhotoContent[],
  pets: petsPhotos as PhotographyPhotoContent[],
  project: projectPhotos as PhotographyPhotoContent[],
};

export const photographyProjectMetaContent = projectMeta;

export const photographySeriesContent = series as PhotographySeriesContent[];
