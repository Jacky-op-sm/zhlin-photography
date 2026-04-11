'use client'

import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import PhotoViewer from './PhotoViewer'
import type { Photo } from '@/lib/types'

interface TightGalleryGridProps {
  photos: Photo[]
}

export default function TightGalleryGrid({ photos }: TightGalleryGridProps) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openViewer = useCallback((index: number) => {
    setCurrentIndex(index)
    setViewerOpen(true)
  }, [])

  const closeViewer = useCallback(() => {
    setViewerOpen(false)
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : prev))
  }, [photos.length])

  const columnCountClass = useMemo(() => 'columns-1 md:columns-2 xl:columns-3', [])

  if (photos.length === 0) {
    return (
      <section className="photo-gallery-section">
        <div className="site-shell">
          <div className="photo-gallery-empty">
            This series does not have images yet.
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="photo-gallery-section">
        <div className="site-shell">
          <div className={`${columnCountClass} photo-gallery-masonry`}>
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className="group photo-gallery-item"
                onClick={() => openViewer(index)}
                aria-label={`View fullsize ${photo.title}`}
              >
                <div
                  className="photo-gallery-media"
                  style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                >
                  <Image
                    src={photo.thumbnail}
                    alt={photo.title}
                    fill
                    className="object-cover photo-gallery-hover"
                    style={{ transform: 'scale(1)' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    priority={index < 2}
                  />
                  <div className="photo-gallery-overlay">
                    <span>View fullsize</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {viewerOpen && (
        <PhotoViewer
          photos={photos}
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
