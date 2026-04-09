'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { PhotoCategory, PhotographyNavCategory } from '@/lib/types'
import { PhotoCategory as PC } from '@/lib/types'

interface CategoryFilterProps {
  currentCategory: PhotoCategory
}

const categories: { id: PhotographyNavCategory; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: PC.Street, label: '街头' },
  { id: PC.Pets, label: '宠物' },
  { id: PC.Project, label: '项目' },
]

export default function CategoryFilter({ currentCategory }: CategoryFilterProps) {
  const router = useRouter()

  const handleCategoryChange = (category: PhotographyNavCategory) => {
    if (category === 'all') {
      router.push('/photography', { scroll: false })
    } else {
      router.push(
        `/photography?category=${encodeURIComponent(category)}`,
        { scroll: false }
      )
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
      {categories.map((category) => {
        const isActive = currentCategory === category.id
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`
              relative px-4 py-2 text-sm md:text-base font-medium rounded-full
              transition-all duration-300 ease-out
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
                className="absolute inset-0 bg-gray-900 dark:bg-white rounded-full -z-10"
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
