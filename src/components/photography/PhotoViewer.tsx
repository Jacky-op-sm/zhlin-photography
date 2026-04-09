'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { Photo } from '@/lib/types'

interface PhotoViewerProps {
  photos: Photo[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

export default function PhotoViewer({
  photos,
  initialIndex,
  isOpen,
  onClose,
  onPrevious,
  onNext,
}: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const currentPhoto = photos[currentIndex]
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && hasNext) {
      handleNext()
    }
    if (isRightSwipe && hasPrevious) {
      handlePrevious()
    }
  }

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      setImageLoaded(false)
      setLoadProgress(0)
      onPrevious()
    }
  }, [hasPrevious, onPrevious])

  const handleNext = useCallback(() => {
    if (hasNext) {
      setImageLoaded(false)
      setLoadProgress(0)
      onNext()
    }
  }, [hasNext, onNext])

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setImageLoaded(false)
    setLoadProgress(0)
  }, [initialIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handlePrevious, handleNext, onClose])

  const simulateProgress = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 90) {
        clearInterval(interval)
      }
      setLoadProgress(Math.min(progress, 90))
    }, 100)
    return interval
  }

  const handleImageLoad = () => {
    setLoadProgress(100)
    setTimeout(() => {
      setImageLoaded(true)
    }, 200)
  }

  useEffect(() => {
    const interval = simulateProgress()
    return () => clearInterval(interval)
  }, [currentIndex])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0 z-0" />

      <button
        className="absolute top-4 right-4 z-20 p-2 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
        aria-label="关闭"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {hasPrevious && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
          onClick={(e) => {
            e.stopPropagation()
            handlePrevious()
          }}
          aria-label="上一张"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {hasNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all md:right-8"
          onClick={(e) => {
            e.stopPropagation()
            handleNext()
          }}
          aria-label="下一张"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white text-lg md:text-xl font-medium mb-2">
            {currentPhoto.title}
          </h2>
          {currentPhoto.description && (
            <p className="text-white/70 text-sm mb-3">
              {currentPhoto.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 text-white/60 text-sm">
            {currentPhoto.location && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {currentPhoto.location}
              </span>
            )}
            {currentPhoto.date && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {currentPhoto.date}
              </span>
            )}
          </div>
          <p className="text-white/40 text-xs mt-2">
            {currentIndex + 1} / {photos.length}
          </p>
        </div>
      </div>

      <div
        className="relative z-10 max-w-[90vw] max-h-[70vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/80 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${loadProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-white/50 text-sm mt-3">加载中...</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhoto.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.95 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative"
          >
            <Image
              src={currentPhoto.src}
              alt={currentPhoto.title}
              width={currentPhoto.width || 1200}
              height={currentPhoto.height || 800}
              className={`object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              priority
              sizes="(max-width: 768px) 90vw, 80vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
