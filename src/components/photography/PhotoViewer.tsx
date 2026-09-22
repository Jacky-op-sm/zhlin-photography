'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/ui/Modal'
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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

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

  if (!isOpen || !currentPhoto) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="photo-viewer"
      ariaLabel={`照片查看器：${currentPhoto.title}`}
      initialFocusRef={closeButtonRef}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' && hasPrevious) {
          event.preventDefault()
          handlePrevious()
        } else if (event.key === 'ArrowRight' && hasNext) {
          event.preventDefault()
          handleNext()
        }
      }}
    >
      <div
        className="photo-viewer-interaction-layer"
        data-touch={isTouchLike ? 'true' : 'false'}
        onTouchStart={(event) => {
          setTouchEnd(null)
          setTouchStart(event.targetTouches[0].clientX)
        }}
        onTouchMove={(event) => {
          setTouchEnd(event.targetTouches[0].clientX)
        }}
        onTouchEnd={() => {
          if (touchStart === null || touchEnd === null) return
          const distance = touchStart - touchEnd

          if (distance > minSwipeDistance && hasNext) {
            handleNext()
          } else if (distance < -minSwipeDistance && hasPrevious) {
            handlePrevious()
          }
        }}
      >
        <button
          ref={closeButtonRef}
          className="photo-viewer-close"
          onClick={onClose}
          aria-label="关闭照片查看器"
        >
          <span className="photo-viewer-close-icon" aria-hidden="true" />
        </button>

        <p className="photo-viewer-counter" aria-live="polite">
          {initialIndex + 1} / {photos.length}
        </p>

        <div className="photo-viewer-image-wrap">
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
          <div className="photo-viewer-controls">
            {hasPrevious ? (
              <button
                className="photo-viewer-nav photo-viewer-nav-prev"
                onClick={handlePrevious}
                aria-label="上一张照片"
              >
                <span
                  className="photo-viewer-chevron photo-viewer-chevron--left scale-x-110 -translate-x-[1px]"
                  aria-hidden="true"
                />
              </button>
            ) : (
              <span
                className="photo-viewer-nav-placeholder"
                aria-hidden="true"
              />
            )}

            {hasNext ? (
              <button
                className="photo-viewer-nav photo-viewer-nav-next"
                onClick={handleNext}
                aria-label="下一张照片"
              >
                <span
                  className="photo-viewer-chevron photo-viewer-chevron--right scale-x-110 translate-x-[1px]"
                  aria-hidden="true"
                />
              </button>
            ) : (
              <span
                className="photo-viewer-nav-placeholder"
                aria-hidden="true"
              />
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
