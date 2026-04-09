import PhotographyBoard from '@/components/photography/PhotographyBoard'
import { getAllPhotos } from '@/lib/data/photos'
import type { CategoryInfo, PhotoCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

const categories: CategoryInfo[] = [
  {
    id: 'street',
    name: 'Street',
    description: '街头摄影 - 捕捉城市中的瞬间与情绪',
    coverImage: '/assets/photos/street/street-scene-1.jpg',
  },
  {
    id: 'pets',
    name: 'Pets',
    description: '宠物摄影 - 定格毛孩子的可爱时刻',
    coverImage: '/assets/photos/pets/Z52_6041.jpg',
  },
  {
    id: 'project',
    name: 'Project',
    description: '项目作品 - 持续创作的专题摄影',
    coverImage: '/assets/photos/project/1.jpg',
  },
]

function normalizeCategory(value?: string | string[]): PhotoCategory {
  const category = Array.isArray(value) ? value[0] : value

  if (
    category === 'all' ||
    category === 'street' ||
    category === 'pets' ||
    category === 'project'
  ) {
    return category
  }

  return 'all'
}

interface PhotographyPageProps {
  searchParams?: {
    category?: string | string[]
  }
}

export default async function PhotographyPage({
  searchParams,
}: PhotographyPageProps) {
  const selectedCategory = normalizeCategory(searchParams?.category)
  const photos = await getAllPhotos()

  return (
    <PhotographyBoard
      categories={categories}
      photos={photos}
      selectedCategory={selectedCategory}
    />
  )
}
