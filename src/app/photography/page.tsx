'use client'

import { motion } from 'framer-motion'
import CategoryCard from '@/components/photography/CategoryCard'
import type { CategoryInfo } from '@/lib/types'

const categories: CategoryInfo[] = [
  {
    id: 'street',
    name: 'Street',
    description: '街头摄影 - 捕捉城市中的瞬间与情绪',
    coverImage: '/assets/photos/street/placeholder.jpg',
  },
  {
    id: 'pets',
    name: 'Pets',
    description: '宠物摄影 - 定格毛孩子的可爱时刻',
    coverImage: '/assets/photos/pets/placeholder.jpg',
  },
  {
    id: 'project',
    name: 'Project',
    description: '项目作品 - 持续创作的专题摄影',
    coverImage: '/assets/photos/project/placeholder.jpg',
  },
]

export default function PhotographyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Photography
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            用镜头记录生活中的真实瞬间。街头、宠物、项目，每一个分类都是一次观察世界的独特视角。
          </motion.p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pb-20 md:pb-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
