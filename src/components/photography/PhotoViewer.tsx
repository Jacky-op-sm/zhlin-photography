'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
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
  const [isTouchLike, setIsTouchLike] = useState(false)

  const currentPhoto = photos[initialIndex]
  const hasPrevious = initialIndex > 0
  const hasNext = initialIndex < photos.length - 1
  const minSwipeDistance = 50

  const handlePrevious = useCallback(() => {
    if (!hasPrevious) return
    onPrevious()
  }, [hasPrevious, onPrevious])

  const handleNext = useCallback(() => {
    if (!hasNext) return
    onNext()
  }, [hasNext, onNext])

  useEffect(() => {
    const coarsePointerQuery = window.matchMedia('(hover: none) and (pointer: coarse)')
    const updatePointerMode = () => {
      setIsTouchLike(coarsePointerQuery.matches || navigator.maxTouchPoints > 0)
    }

    updatePointerMode()
    coarsePointerQuery.addEventListener('change', updatePointerMode)
    return () => coarsePointerQuery.removeEventListener('change', updatePointerMode)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowLeft' && hasPrevious) {
        handlePrevious()
      } else if (event.key === 'ArrowRight' && hasNext) {
        handleNext()
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
  }, [handleNext, handlePrevious, hasNext, hasPrevious, isOpen, onClose])

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || photos.length === 0) return
    const preloadIndexes = [
      initialIndex - 2,
      initialIndex - 1,
      initialIndex + 1,
      initialIndex + 2,
    ].filter((index) => index >= 0 && index < photos.length)

    const deduped = Array.from(new Set(preloadIndexes))
    deduped.forEach((index) => {
      const photo = photos[index]
      if (!photo) return
      const preloadImage = new window.Image()
      preloadImage.src = photo.filename
      if (typeof preloadImage.decode === 'function') {
        void preloadImage.decode().catch(() => undefined)
      }
    })
  }, [initialIndex, isOpen, photos])

  if (!isOpen || !currentPhoto) {
    return null
  }

  return (
    <div
      className="photo-viewer"
      data-touch={isTouchLike ? 'true' : 'false'}
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
          handleNext()
        } else if (distance < -minSwipeDistance && hasPrevious) {
          handlePrevious()
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
        <span className="photo-viewer-close-icon" aria-hidden="true" />
      </button>

      <p className="photo-viewer-counter" aria-live="polite">
        {initialIndex + 1} / {photos.length}
      </p>

      <div className="photo-viewer-image-wrap" onClick={(event) => event.stopPropagation()}>
        <Image
          key={currentPhoto.id}
          src={currentPhoto.filename}
          alt={currentPhoto.title}
          width={currentPhoto.width}
          height={currentPhoto.height}
          className="photo-viewer-image"
          priority
          loading="eager"
          sizes="92vw"
        />
      </div>

      {(hasPrevious || hasNext) ? (
        <div className="photo-viewer-controls" onClick={(event) => event.stopPropagation()}>
          {hasPrevious ? (
            <button
              className="photo-viewer-nav photo-viewer-nav-prev"
              onClick={(event) => {
                event.stopPropagation()
                handlePrevious()
              }}
              aria-label="Previous image"
            >
              <span
                className="photo-viewer-chevron photo-viewer-chevron--left scale-x-110 -translate-x-[1px]"
                aria-hidden="true"
              />
            </button>
          ) : <span className="photo-viewer-nav-placeholder" aria-hidden="true" />}

          {hasNext ? (
            <button
              className="photo-viewer-nav photo-viewer-nav-next"
              onClick={(event) => {
                event.stopPropagation()
                handleNext()
              }}
              aria-label="Next image"
            >
              <span
                className="photo-viewer-chevron photo-viewer-chevron--right scale-x-110 translate-x-[1px]"
                aria-hidden="true"
              />
            </button>
          ) : <span className="photo-viewer-nav-placeholder" aria-hidden="true" />}
        </div>
      ) : null}
    </div>
  )
}
