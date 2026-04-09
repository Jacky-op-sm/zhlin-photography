'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { PhotoCategory } from '@/lib/types'

interface CategoryFilterProps {
  currentCategory: PhotoCategory
}

const categories: { id: PhotoCategory; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'street', label: '街头' },
  { id: 'pets', label: '宠物' },
  { id: 'project', label: '项目' },
]

export default function CategoryFilter({ currentCategory }: CategoryFilterProps) {
  const router = useRouter()

  const handleCategoryChange = (category: PhotoCategory) => {
    router.push(`/photography?category=${category}`, { scroll: false })
  }

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2 md:mb-12 md:gap-3">
      {categories.map((category) => {
        const isActive = currentCategory === category.id
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`
              relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-out md:text-base
              ${
                isActive
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            {isActive && (
              <motion.span
                layoutId="activeCategory"
                className="absolute inset-0 -z-10 rounded-full bg-gray-900 dark:bg-white"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            {category.label}
          </button>
        )
      })}
    </div>
  )
}
