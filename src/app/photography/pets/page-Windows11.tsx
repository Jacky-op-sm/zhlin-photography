'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PhotoGrid from '@/components/photography/PhotoGrid'
import CategoryFilter from '@/components/photography/CategoryFilter'
import { Photo, PhotoCategory } from '@/lib/types'

export default function PetsPage() {
  const [selectedCategory] = useState<PhotoCategory>(PhotoCategory.Pets)
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    import('@/lib/data/photos').then((module) => {
      module.getPhotosByCategory(PhotoCategory.Pets).then(setPhotos)
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
            Pets
          </motion.h1>
          <motion.p
            className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            宠物摄影是记录家庭成员的一种方式。这些毛茸茸的小家伙们，总能给我带来无限的欢乐和温暖。
          </motion.p>
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
