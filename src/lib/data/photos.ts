import { Photo, PhotoCategory } from '../types';
import photosData from '../../../data/photos.json';

/**
 * 将 JSON 数据转换为 Photo 类型的数组
 */
function transformPhotos(): Photo[] {
  const allPhotos: Photo[] = [];

  // 处理 street 分类
  for (const item of photosData.street) {
    allPhotos.push({
      ...item,
      category: PhotoCategory.Street,
    });
  }

  // 处理 pets 分类
  for (const item of photosData.pets) {
    allPhotos.push({
      ...item,
      category: PhotoCategory.Pets,
    });
  }

  // 处理 project 分类
  for (const item of photosData.project) {
    allPhotos.push({
      ...item,
      category: PhotoCategory.Project,
    });
  }

  return allPhotos;
}

// 缓存转换后的照片数据
let cachedPhotos: Photo[] | null = null;

/**
 * 获取所有照片
 */
export async function getAllPhotos(): Promise<Photo[]> {
  if (!cachedPhotos) {
    cachedPhotos = transformPhotos();
  }
  return cachedPhotos;
}

/**
 * 根据分类获取照片
 */
export async function getPhotosByCategory(category: PhotoCategory): Promise<Photo[]> {
  const allPhotos = await getAllPhotos();
  if (category === PhotoCategory.All) {
    return allPhotos;
  }
  return allPhotos.filter(photo => photo.category === category);
}

/**
 * 根据 ID 获取单张照片
 */
export async function getPhotoById(id: string): Promise<Photo | null> {
  const allPhotos = await getAllPhotos();
  return allPhotos.find(photo => photo.id === id) || null;
}

/**
 * 获取项目元数据
 */
export function getProjectMeta() {
  return photosData.projectMeta;
}
