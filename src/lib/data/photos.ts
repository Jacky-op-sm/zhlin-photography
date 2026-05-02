import { photographyPhotosContent, photographyProjectMetaContent } from '@/lib/content/photography';
import { PhotoCategory, type Photo } from '../types';

function transformPhotos(): Photo[] {
  return [
    ...photographyPhotosContent.street.map((item) => ({
      ...item,
      category: PhotoCategory.Street,
    })),
    ...photographyPhotosContent.pets.map((item) => ({
      ...item,
      category: PhotoCategory.Pets,
    })),
    ...photographyPhotosContent.project.map((item) => ({
      ...item,
      category: PhotoCategory.Project,
    })),
  ];
}

let cachedPhotos: Photo[] | null = null;

export async function getAllPhotos(): Promise<Photo[]> {
  if (!cachedPhotos) {
    cachedPhotos = transformPhotos();
  }

  return cachedPhotos;
}

export async function getPhotosByCategory(category: PhotoCategory): Promise<Photo[]> {
  const allPhotos = await getAllPhotos();

  if (category === PhotoCategory.All) {
    return allPhotos;
  }

  return allPhotos.filter((photo) => photo.category === category);
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  const allPhotos = await getAllPhotos();
  return allPhotos.find((photo) => photo.id === id) || null;
}

export function getProjectMeta() {
  return photographyProjectMetaContent;
}
