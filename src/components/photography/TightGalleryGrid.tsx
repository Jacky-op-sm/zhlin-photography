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
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }, [photos.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }, [photos.length])

  const columnCountClass = useMemo(
    () => 'columns-1 sm:columns-2 xl:columns-3',
    []
  )

  if (photos.length === 0) {
    return (
      <section className="photography-section">
        <div className="photography-shell">
          <div className="rounded-2xl border border-dashed border-[var(--portfolio-border)] px-6 py-16 text-center text-[var(--portfolio-soft)]">
            This series does not have images yet.
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="photography-section">
        <div className="photography-shell">
          <div
            className={`${columnCountClass} [column-gap:var(--photography-image-gap)]`}
          >
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className="group photography-gallery-item mb-[var(--photography-image-gap)] block w-full break-inside-avoid text-left"
                onClick={() => openViewer(index)}
                aria-label={`Open ${photo.title}`}
              >
                <div
                  className="photography-media-shell relative overflow-hidden"
                  style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                >
                  <Image
                    src={photo.thumbnail}
                    alt={photo.title}
                    fill
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.025] group-hover:brightness-[0.97]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    priority={index < 2}
                  />
                </div>

                <div className="pt-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--portfolio-soft)]">
                    {photo.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--portfolio-muted)]">
                    {photo.location} · {photo.takenAt}
                  </p>
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

