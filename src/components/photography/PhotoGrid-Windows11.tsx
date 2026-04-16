'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import PhotoCard from './PhotoCard'
import PhotoViewer from './PhotoViewer'
import type { Photo, PhotographyNavCategory } from '@/lib/types'

interface PhotoGridProps {
  photos: Photo[]
  selectedCategory: PhotographyNavCategory
}

export default function PhotoGrid({ photos, selectedCategory }: PhotoGridProps) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter(photo => photo.category === selectedCategory)

  const openViewer = useCallback((index: number) => {
    setCurrentIndex(index)
    setViewerOpen(true)
  }, [])

  const closeViewer = useCallback(() => {
    setViewerOpen(false)
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => 
      prev === 0 ? filteredPhotos.length - 1 : prev - 1
    )
  }, [filteredPhotos.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => 
      prev === filteredPhotos.length - 1 ? 0 : prev + 1
    )
  }, [filteredPhotos.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    observerRef.current = observer

    const gridItems = gridRef.current?.querySelectorAll('.grid-item')
    gridItems?.forEach((item) => {
      observer.observe(item)
    })

    return () => {
      observer.disconnect()
    }
  }, [filteredPhotos])

  useEffect(() => {
    if (typeof window === 'undefined' || filteredPhotos.length === 0) return

    let cancelled = false
    const preloadAll = () => {
      filteredPhotos.forEach((photo) => {
        if (cancelled) return
        const preloadImage = new window.Image()
        preloadImage.src = photo.filename
      })
    }

    const idleCallback = window.requestIdleCallback?.(() => preloadAll())
    if (idleCallback == null) {
      const timeoutId = window.setTimeout(preloadAll, 120)
      return () => {
        cancelled = true
        window.clearTimeout(timeoutId)
      }
    }

    return () => {
      cancelled = true
      window.cancelIdleCallback?.(idleCallback)
    }
  }, [filteredPhotos])

  return (
    <>
      <div
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
      >
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="grid-item opacity-0 translate-y-4 transition-all duration-500 ease-out"
          >
            <PhotoCard
              photo={photo}
              onClick={() => openViewer(index)}
              index={index}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .grid-item {
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .grid-item.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .grid-item:nth-child(1) { transition-delay: 0ms; }
        .grid-item:nth-child(2) { transition-delay: 50ms; }
        .grid-item:nth-child(3) { transition-delay: 100ms; }
        .grid-item:nth-child(4) { transition-delay: 150ms; }
        .grid-item:nth-child(5) { transition-delay: 200ms; }
        .grid-item:nth-child(6) { transition-delay: 250ms; }
        .grid-item:nth-child(7) { transition-delay: 300ms; }
        .grid-item:nth-child(8) { transition-delay: 350ms; }
      `}</style>

      {viewerOpen && (
        <PhotoViewer
          photos={filteredPhotos}
          initialIndex={currentIndex}
          isOpen={viewerOpen}
          onClose={closeViewer}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      )}
    </>
  )
}
