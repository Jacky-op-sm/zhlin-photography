'use client'

import { useEffect, useState } from 'react'
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
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const currentPhoto = photos[initialIndex]
  const hasPrevious = initialIndex > 0
  const hasNext = initialIndex < photos.length - 1
  const minSwipeDistance = 50

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowLeft' && hasPrevious) {
        onPrevious()
      } else if (event.key === 'ArrowRight' && hasNext) {
        onNext()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [hasNext, hasPrevious, isOpen, onClose, onNext, onPrevious])

  if (!isOpen || !currentPhoto) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      className="photo-viewer"
      onClick={onClose}
      onTouchStart={(event) => {
        setTouchEnd(null)
        setTouchStart(event.targetTouches[0].clientX)
      }}
      onTouchMove={(event) => {
        setTouchEnd(event.targetTouches[0].clientX)
      }}
      onTouchEnd={() => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd

        if (distance > minSwipeDistance && hasNext) {
          onNext()
        } else if (distance < -minSwipeDistance && hasPrevious) {
          onPrevious()
        }
      }}
    >
      <button
        className="photo-viewer-close"
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        aria-label="Close fullsize viewer"
      >
        Close
      </button>

      <p className="photo-viewer-counter" aria-live="polite">
        {initialIndex + 1} / {photos.length}
      </p>

      {hasPrevious ? (
        <button
          className="photo-viewer-nav photo-viewer-nav-prev"
          onClick={(event) => {
            event.stopPropagation()
            onPrevious()
          }}
          aria-label="Previous image"
        >
          Prev
        </button>
      ) : null}

      {hasNext ? (
        <button
          className="photo-viewer-nav photo-viewer-nav-next"
          onClick={(event) => {
            event.stopPropagation()
            onNext()
          }}
          aria-label="Next image"
        >
          Next
        </button>
      ) : null}

      <div className="photo-viewer-image-wrap" onClick={(event) => event.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhoto.id}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.3 }}
            transition={{ duration: 0.18 }}
          >
            <Image
              src={currentPhoto.filename}
              alt={currentPhoto.title}
              width={currentPhoto.width}
              height={currentPhoto.height}
              className="photo-viewer-image"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
