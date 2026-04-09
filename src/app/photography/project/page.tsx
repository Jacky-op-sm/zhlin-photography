'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PhotoGrid from '@/components/photography/PhotoGrid'
import CategoryFilter from '@/components/photography/CategoryFilter'
import { Photo, PhotoCategory } from '@/lib/types'

// 项目描述
const projectInfo = {
  title: '宿舍阳台下的十字路口',
  titleEn: 'The Intersection Under My Balcony',
  description: '这个项目始于对宿舍窗外十字路口的持续观察。每日重复的场景中，光影、行人、天气、时间不断变化，我在同一地点持续记录，试图通过时间的累积揭示日常中的诗意。从清晨的第一缕阳光，到深夜最后一盏路灯熄灭，这个不变的十字路口见证着城市的呼吸与变迁。',
  startDate: '2023年',
  ongoing: true,
}

export default function ProjectPage() {
  const [selectedCategory] = useState<PhotoCategory>('project')
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    import('@/lib/data/photos').then((module) => {
      module.getPhotosByCategory(PhotoCategory.Project).then(setPhotos)
    })
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Project
          </motion.h1>
          <motion.p
            className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            持续创作的专题摄影项目
          </motion.p>
        </div>
      </section>

      {/* Project Description */}
      <section className="px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-neutral-100 dark:bg-gray-700 text-neutral-700 dark:text-neutral-300 text-sm rounded-full">
                {projectInfo.startDate} - {projectInfo.ongoing ? '进行中' : '已结束'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              {projectInfo.title}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {projectInfo.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <CategoryFilter currentCategory={selectedCategory} />
        </div>
      </section>

      {/* Photo Grid */}
      <section className="pb-20 md:pb-32 px-4">
        <div className="max-w-6xl mx-auto">
          <PhotoGrid photos={photos} selectedCategory={selectedCategory} />
        </div>
      </section>
    </div>
  )
}
