'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import CategoryCard from './CategoryCard'
import CategoryFilter from './CategoryFilter'
import PhotoGrid from './PhotoGrid'
import type { CategoryInfo, Photo, PhotoCategory } from '@/lib/types'

interface PhotographyBoardProps {
  categories: CategoryInfo[]
  photos: Photo[]
  selectedCategory: PhotoCategory
}

const categoryLabels: Record<PhotoCategory, string> = {
  all: '全部',
  street: '街头',
  pets: '宠物',
  project: '项目',
}

export default function PhotographyBoard({
  categories,
  photos,
  selectedCategory,
}: PhotographyBoardProps) {
  const activeCount =
    selectedCategory === 'all'
      ? photos.length
      : photos.filter((photo) => photo.category === selectedCategory).length

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <section className="relative overflow-hidden border-b border-neutral-200/70 dark:border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(231,229,228,0.75),_transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.03),_transparent_35%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <motion.p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-neutral-500 dark:text-neutral-400"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Zhlin Photography / Selected Works
          </motion.p>

          <motion.h1
            className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
          >
            Photography
          </motion.h1>

          <motion.p
            className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300 md:text-lg"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Selected photography with notes on place, light, and time.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
          >
            <span className="rounded-full border border-neutral-300/80 bg-white/80 px-4 py-2 text-sm text-neutral-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-neutral-200">
              {photos.length} 张照片
            </span>
            <span className="rounded-full border border-neutral-300/80 bg-white/80 px-4 py-2 text-sm text-neutral-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-neutral-200">
              {categories.length} 个专题
            </span>
            <span className="rounded-full border border-neutral-300/80 bg-white/80 px-4 py-2 text-sm text-neutral-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-neutral-200">
              当前分类：{categoryLabels[selectedCategory]}
            </span>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <CategoryFilter currentCategory={selectedCategory} />
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              当前展示 {activeCount} 张作品
            </p>
            <Link
              href="/photography"
              className="text-sm font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-white"
            >
              查看全部
            </Link>
          </div>
          <PhotoGrid photos={photos} selectedCategory={selectedCategory} />
        </div>
      </section>

      <section className="px-4 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
                Collections
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                进入专题分类
              </h2>
            </div>
            <p className="max-w-sm text-right text-sm text-neutral-500 dark:text-neutral-400">
              使用分类入口快速跳转到街头、宠物或项目作品。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
