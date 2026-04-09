'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { CategoryInfo, PhotoCategory } from '@/lib/types'

interface CategoryCardProps {
  category: CategoryInfo
  index: number
}

const categoryLabels: Record<Exclude<PhotoCategory, 'all'>, string> = {
  street: '街头摄影',
  pets: '宠物摄影',
  project: '项目摄影',
}

export default function CategoryCard({ category, index }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/photography?category=${category.id}`}>
      <motion.article
        className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 aspect-[4/3]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.15 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={category.coverImage}
          alt={category.name}
          fill
          className={`object-cover transition-transform duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <div
          className={`
            absolute inset-0 bg-gradient-to-t transition-opacity duration-500
            ${isHovered 
              ? 'from-black/80 via-black/40 to-transparent opacity-100' 
              : 'from-black/60 via-black/20 to-transparent opacity-90'
            }
          `}
        />

        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
          <motion.span
            className="text-white/60 text-xs md:text-sm uppercase tracking-wider mb-1"
            animate={{ opacity: isHovered ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
          >
            {categoryLabels[category.id]}
          </motion.span>

          <h3 className="text-white text-xl md:text-2xl font-semibold mb-2">
            {category.name}
          </h3>

          <motion.p
            className="text-white/80 text-sm md:text-base leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: isHovered ? 1 : 0.8, 
              y: isHovered ? 0 : 0 
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {category.description}
          </motion.p>

          <motion.div
            className="mt-3 md:mt-4 flex items-center text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <span className="mr-2">浏览作品</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                isHovered ? 'translate-x-1' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.div>
        </div>

        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
