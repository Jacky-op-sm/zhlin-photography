'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { useIPadPortraitTouch } from '@/lib/hooks/useIPadPortraitTouch'
import type { TravelSliderCard } from '@/lib/content/schemas'
import { getTravelDetailImageClass } from '@/lib/utils/travelDetailImage'

type TravelCardSliderVariant = 'spot' | 'food'

export type TravelCardSliderProps = {
  cards: TravelSliderCard[]
  variant: TravelCardSliderVariant
  cardBackgroundClassName?: string
  openCardAriaLabelPrefix: string
}

export default function TravelCardSlider({
  cards,
  variant,
  cardBackgroundClassName = 'bg-white',
  openCardAriaLabelPrefix,
}: TravelCardSliderProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(cards.length <= 1)

  useEffect(() => {
    const viewport = viewportRef.current
    const cardElements = viewport?.querySelectorAll<HTMLElement>(
      '[data-travel-card-index]',
    )
    const firstCard = cardElements?.[0]
    const lastCard = cardElements?.[cardElements.length - 1]
    if (!viewport || !firstCard || !lastCard) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === firstCard) {
            setAtStart(entry.isIntersecting && entry.intersectionRatio > 0.95)
          }
          if (entry.target === lastCard) {
            setAtEnd(entry.isIntersecting && entry.intersectionRatio > 0.95)
          }
        }
      },
      {
        root: viewport,
        threshold: [0.95, 1],
      },
    )

    observer.observe(firstCard)
    observer.observe(lastCard)
    return () => observer.disconnect()
  }, [cards.length])

  const scrollByCard = useCallback((direction: -1 | 1) => {
    const viewport = viewportRef.current
    if (!viewport) return

    const cardElements = Array.from(
      viewport.querySelectorAll<HTMLElement>('[data-travel-card-index]'),
    )
    if (cardElements.length === 0) return

    const viewportLeft = viewport.getBoundingClientRect().left
    const currentIndex = cardElements.reduce(
      (bestIndex, card, index) => {
        const bestDistance = Math.abs(
          cardElements[bestIndex].getBoundingClientRect().left - viewportLeft,
        )
        const distance = Math.abs(
          card.getBoundingClientRect().left - viewportLeft,
        )
        return distance < bestDistance ? index : bestIndex
      },
      0,
    )
    const targetIndex = Math.min(
      cardElements.length - 1,
      Math.max(0, currentIndex + direction),
    )
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    cardElements[targetIndex]?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }, [])

  const activeCardData =
    activeCardIndex === null ? null : cards[activeCardIndex]
  const detailBlocks =
    activeCardData && activeCardData.detailBlocks.length > 0
      ? activeCardData.detailBlocks
      : activeCardData
        ? [
            {
              text: activeCardData.body,
              ...(activeCardData.imageSrc
                ? {
                    imageSrc: activeCardData.imageSrc,
                    imageAlt: activeCardData.imageAlt,
                  }
                : {}),
            },
          ]
        : []
  const detailTitleId =
    activeCardIndex === null
      ? undefined
      : `${variant}-travel-detail-title-${activeCardIndex}`
  const closeDetail = useCallback(() => setActiveCardIndex(null), [])

  return (
    <div className="mt-8 w-full lg:max-w-[1150px]">
      <div
        ref={viewportRef}
        className="travel-slider-viewport relative left-[calc(50%-50vw)] w-screen py-3"
        data-travel-slider-viewport
      >
        <div className="travel-slider-track">
          {cards.map((card, index) => (
            <button
              key={`${card.eyebrow}-${card.title}-${index}`}
              type="button"
              data-travel-card-index={index}
              className="travel-card-hover-shell travel-slider-card block text-left"
              onClick={() => setActiveCardIndex(index)}
              aria-label={`${openCardAriaLabelPrefix} ${index + 1}`}
            >
              <article
                className={`h-[28rem] overflow-hidden rounded-[1.9rem] ${cardBackgroundClassName} p-6 sm:h-[30.8rem]`}
              >
                <CardContent card={card} variant={variant} />
              </article>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-[1.35rem]">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={atStart}
          aria-label="上一张卡片"
          className="grid h-[2.4rem] w-[2.4rem] place-items-center rounded-full bg-[rgba(236,236,240,1)] text-[rgba(104,104,108,1)] transition-[background-color,color,transform] duration-150 ease-out hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span
            className="photo-viewer-chevron photo-viewer-chevron--left scale-x-110 -translate-x-[1px]"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={atEnd}
          aria-label="下一张卡片"
          className="grid h-[2.4rem] w-[2.4rem] place-items-center rounded-full bg-[rgba(236,236,240,1)] text-[rgba(104,104,108,1)] transition-[background-color,color,transform] duration-150 ease-out hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span
            className="photo-viewer-chevron photo-viewer-chevron--right scale-x-110 translate-x-[1px]"
            aria-hidden="true"
          />
        </button>
      </div>

      <Modal
        isOpen={activeCardData !== null}
        onClose={closeDetail}
        className="travel-detail-modal fixed inset-0 z-[90] overflow-hidden bg-[rgba(15,15,18,0.34)] backdrop-blur-[10px]"
        labelledBy={detailTitleId}
        initialFocusRef={closeButtonRef}
      >
        <div className="travel-detail-modal-scroll h-full overflow-y-auto p-3 sm:p-10 lg:p-14">
          <div className="mx-auto w-full max-w-[1280px]">
            <div className="relative rounded-[1.5rem] bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:rounded-[2.1rem] sm:p-10 lg:p-12">
              <div className="mx-0 max-w-[72rem] sm:mx-[1.57rem] lg:mx-[2.09rem]">
                <p className="text-sm font-semibold text-[rgba(29,29,31,1)] sm:text-base">
                  {activeCardData?.eyebrow}
                </p>
                <h3
                  id={detailTitleId}
                  className="mt-2 whitespace-pre-line text-[2rem] font-semibold leading-[1.18] tracking-tight text-[rgba(29,29,31,1)] sm:mt-3 sm:text-[3.125rem]"
                >
                  {activeCardData?.title}
                </h3>
              </div>

              <div className="mt-8 mx-0 space-y-4 sm:mt-16 sm:mx-[1.57rem] sm:space-y-6 lg:mx-[2.09rem]">
                {detailBlocks.map((block, blockIndex) => (
                  <div
                    key={`${activeCardData?.title ?? 'detail'}-${blockIndex}`}
                    className="rounded-[1.2rem] bg-[rgba(245,245,247,1)] px-5 pb-5 pt-6 sm:min-h-[30rem] sm:rounded-[1.75rem] sm:px-[4.25rem] sm:pb-10 sm:pt-[3.25rem] lg:px-[7.5rem] lg:pt-[3.75rem]"
                  >
                    <div className="space-y-6 sm:space-y-10 lg:space-y-12">
                      <p className="w-full whitespace-pre-line text-[1rem] leading-[1.8] tracking-[0.01em] text-[rgba(29,29,31,1)] sm:text-[1.15rem] lg:text-[1.25rem]">
                        {block.text}
                      </p>
                      {block.imageSrc ? (
                        <div className="mx-0 overflow-hidden rounded-[1rem] sm:mx-3 sm:rounded-[1.35rem] lg:mx-5">
                          <DetailImage
                            src={block.imageSrc}
                            alt={block.imageAlt ?? ''}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeDetail}
          aria-label="关闭详情"
          className="fixed z-[130] grid h-11 w-11 place-items-center rounded-full bg-[rgba(236,236,240,1)] text-[rgba(104,104,108,1)] transition-[background-color,color,transform] duration-150 ease-out hover:scale-[1.02]"
          style={{
            right: 'calc(env(safe-area-inset-right, 0px) + 1rem)',
            top: 'calc(env(safe-area-inset-top, 0px) + var(--site-header-height) + 0.65rem)',
          }}
        >
          <span className="photo-viewer-close-icon" aria-hidden="true" />
        </button>
      </Modal>
    </div>
  )
}

function CardContent({
  card,
  variant,
}: {
  card: TravelSliderCard
  variant: TravelCardSliderVariant
}) {
  const titleClassName =
    variant === 'spot'
      ? 'mt-4 min-h-[2.76em] whitespace-pre-line text-[1.3rem] font-semibold leading-[1.38] tracking-tight text-neutral-900 sm:mt-[0.95rem] sm:text-[1.5rem]'
      : 'mt-3 min-h-[2.76em] whitespace-pre-line text-[1.3rem] font-semibold leading-[1.38] tracking-tight text-neutral-900 sm:text-[1.5rem]'
  const bodyClassName =
    variant === 'spot'
      ? 'mt-[1.15rem] text-[0.9rem] leading-[1.52] text-neutral-800 sm:mt-[1.32rem] sm:text-[0.95rem]'
      : 'mt-4 text-[0.9rem] leading-[1.52] text-neutral-800 sm:mt-[1.32rem] sm:text-[0.95rem]'

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <p className="text-[0.85rem] font-semibold tracking-tight text-neutral-900 sm:text-[0.95rem]">
        {card.eyebrow}
      </p>
      <h3 className={titleClassName}>{card.title}</h3>
      <p className={bodyClassName}>{card.body}</p>

      {card.imageSrc ? (
        <div className="relative mt-auto h-[12.9rem] flex-shrink overflow-hidden rounded-[1.35rem] bg-[rgba(245,245,247,1)] sm:h-[14.1rem]">
          <Image
            src={card.imageSrc}
            alt={card.imageAlt ?? ''}
            fill
            sizes="(max-width: 767px) calc(100vw - 52px), 371px"
            className="object-cover"
          />
        </div>
      ) : null}
    </div>
  )
}

function DetailImage({ src, alt }: { src: string; alt: string }) {
  const [isPortrait, setIsPortrait] = useState(false)
  const isIPadPortraitTouch = useIPadPortraitTouch()

  return (
    <Image
      src={src}
      alt={alt}
      width={1400}
      height={900}
      onLoad={(event) => {
        setIsPortrait(
          event.currentTarget.naturalHeight
            > event.currentTarget.naturalWidth,
        )
      }}
      className={getTravelDetailImageClass({
        isPortrait,
        isIPadPortraitTouch,
      })}
    />
  )
}
