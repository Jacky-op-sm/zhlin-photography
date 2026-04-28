'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState, type TouchEvent } from 'react';
import { useIPadPortraitTouch } from '@/lib/hooks/useIPadPortraitTouch';
import type { TravelSliderCard } from '@/lib/types/travel-slider';
import { getTravelDetailImageClass } from '@/lib/utils/travelDetailImage';

const VISIBLE_CARDS = 3;
const CARD_GAP_PX = 19.2;
const SIDE_PEEK_PX = 56;
const CARD_WIDTH_PX = 370.5;
const DESKTOP_MARGIN_FALLBACK_PX = 260;
const SLIDE_FINE_TUNE_PX = 0;
const CARD_HEIGHT_REM = 28;
const CARD_HEIGHT_MULTIPLIER = 1.1;
const MOBILE_BREAKPOINT_PX = 768;
const SWIPE_MIN_DISTANCE_PX = 44;

export default function FoodSlider({ cards }: { cards: TravelSliderCard[] }) {
  const sliderRootRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(1200);
  const [measuredContainerOffsetPx, setMeasuredContainerOffsetPx] = useState<number | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchCurrentRef = useRef<{ x: number; y: number } | null>(null);
  const touchAxisLockRef = useRef<'x' | 'y' | null>(null);
  const swipeTriggeredRef = useRef(false);

  const isMobile = viewportWidth < MOBILE_BREAKPOINT_PX;
  const visibleCards = isMobile ? 1 : VISIBLE_CARDS;
  const cardGapPx = isMobile ? 12 : CARD_GAP_PX;
  const sidePeekPx = isMobile ? 20 : SIDE_PEEK_PX;
  const cardWidthPx = isMobile ? Math.max(248, Math.min(360, viewportWidth - 52)) : CARD_WIDTH_PX;
  const marginPx = isMobile ? 16 : measuredContainerOffsetPx ?? DESKTOP_MARGIN_FALLBACK_PX;
  const maxStartIndex = Math.max(0, cards.length - visibleCards);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(maxStartIndex, prev + 1));
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchCurrentRef.current = { x: touch.clientX, y: touch.clientY };
    touchAxisLockRef.current = null;
    swipeTriggeredRef.current = false;
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !touchStartRef.current) return;

    const touch = event.touches[0];
    const current = { x: touch.clientX, y: touch.clientY };
    touchCurrentRef.current = current;

    const deltaX = current.x - touchStartRef.current.x;
    const deltaY = current.y - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (touchAxisLockRef.current === null && (absX > 8 || absY > 8)) {
      touchAxisLockRef.current = absX > absY ? 'x' : 'y';
    }

    if (touchAxisLockRef.current === 'x' && event.cancelable) {
      event.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !touchStartRef.current || !touchCurrentRef.current) {
      touchStartRef.current = null;
      touchCurrentRef.current = null;
      touchAxisLockRef.current = null;
      return;
    }

    const deltaX = touchCurrentRef.current.x - touchStartRef.current.x;
    const deltaY = touchCurrentRef.current.y - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX >= SWIPE_MIN_DISTANCE_PX && absX > absY) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
      swipeTriggeredRef.current = true;
    }

    touchStartRef.current = null;
    touchCurrentRef.current = null;
    touchAxisLockRef.current = null;
  };

  const edgePeekOffsetPx = startIndex === 0 ? 0 : sidePeekPx;
  const stepPx = cardWidthPx + cardGapPx + SLIDE_FINE_TUNE_PX;
  const firstStepCorrectionPx = startIndex > 0 ? sidePeekPx : 0;
  const translateX = marginPx + edgePeekOffsetPx - firstStepCorrectionPx - startIndex * stepPx;

  useLayoutEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    const updateMeasuredContainerOffset = () => {
      const root = sliderRootRef.current;
      const viewport = root?.querySelector('[data-travel-slider-viewport]') as HTMLElement | null;
      const container = root?.parentElement as HTMLElement | null;
      if (!viewport || !container) return;
      setMeasuredContainerOffsetPx(container.getBoundingClientRect().left - viewport.getBoundingClientRect().left);
    };

    const updateLayout = () => {
      updateViewportWidth();
      updateMeasuredContainerOffset();
    };

    updateLayout();
    window.addEventListener('resize', updateLayout, { passive: true });

    const root = sliderRootRef.current;
    const container = root?.parentElement ?? null;
    const resizeObserver = new ResizeObserver(updateLayout);
    if (root) resizeObserver.observe(root);
    if (container) resizeObserver.observe(container);

    return () => {
      window.removeEventListener('resize', updateLayout);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    setStartIndex((prev) => Math.min(prev, maxStartIndex));
  }, [maxStartIndex]);

  useEffect(() => {
    if (activeCard === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveCard(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeCard]);

  const activeCardData = activeCard !== null ? cards[activeCard - 1] : null;
  const detailBlocks =
    activeCardData && activeCardData.detailBlocks.length > 0
      ? activeCardData.detailBlocks
      : activeCardData
        ? [
            {
              text: activeCardData.body,
              imageSrc: activeCardData.imageSrc,
              imageAlt: activeCardData.imageAlt,
            },
          ]
        : [];

  return (
    <div ref={sliderRootRef} className="mt-8 w-full lg:max-w-[1150px]">
      <div
        className="travel-slider-viewport relative left-[calc(50%-50vw)] w-screen overflow-x-hidden overflow-y-visible py-3"
        data-travel-slider-viewport
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClickCapture={(event) => {
          if (!swipeTriggeredRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          swipeTriggeredRef.current = false;
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(${translateX}px)`,
            gap: `${cardGapPx}px`,
          }}
        >
          {cards.map((card, index) => {
            const cardId = index + 1;
            return (
              <button
                key={cardId}
                type="button"
                className="travel-card-hover-shell block text-left"
                style={{ flex: `0 0 ${cardWidthPx}px` }}
                onClick={() => setActiveCard(cardId)}
                aria-label={`Open food card ${cardId}`}
              >
                <article className="overflow-hidden rounded-[1.9rem] bg-[rgba(245,245,247,1)] p-6" style={{ height: `${CARD_HEIGHT_REM * CARD_HEIGHT_MULTIPLIER}rem` }}>
                  <FoodCardContent card={card} />
                </article>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-[1.35rem]">
        <button
          type="button"
          onClick={handlePrev}
          disabled={startIndex === 0}
          aria-label="Previous"
          className="grid h-[2.4rem] w-[2.4rem] place-items-center rounded-full bg-[rgba(236,236,240,1)] text-[rgba(104,104,108,1)] transition-[background-color,color,transform] duration-150 ease-out hover:bg-[rgba(236,236,240,1)] hover:text-[rgba(104,104,108,1)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="photo-viewer-chevron photo-viewer-chevron--left scale-x-110 -translate-x-[1px]" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={startIndex === maxStartIndex}
          aria-label="Next"
          className="grid h-[2.4rem] w-[2.4rem] place-items-center rounded-full bg-[rgba(236,236,240,1)] text-[rgba(104,104,108,1)] transition-[background-color,color,transform] duration-150 ease-out hover:bg-[rgba(236,236,240,1)] hover:text-[rgba(104,104,108,1)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="photo-viewer-chevron photo-viewer-chevron--right scale-x-110 translate-x-[1px]" aria-hidden="true" />
        </button>
      </div>

      {activeCard !== null ? (
        <>
          <div
            className="fixed inset-0 z-[90] overflow-y-auto bg-[rgba(15,15,18,0.34)] p-3 backdrop-blur-[10px] sm:p-10 lg:p-14"
            onClick={() => setActiveCard(null)}
          >
            <div className="mx-auto w-full max-w-[1280px]">
              <div
                className="relative rounded-[1.5rem] bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:rounded-[2.1rem] sm:p-10 lg:p-12"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mx-0 max-w-[72rem] sm:mx-[1.57rem] lg:mx-[2.09rem]">
                  <p className="text-sm font-semibold text-[rgba(29,29,31,1)] sm:text-base">{activeCardData?.eyebrow}</p>
                  <h3 className="mt-2 text-[2rem] font-semibold leading-[1.18] tracking-tight text-[rgba(29,29,31,1)] sm:mt-3 sm:text-[3.125rem]">
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
                        <div className="mx-0 overflow-hidden rounded-[1rem] sm:mx-3 sm:rounded-[1.35rem] lg:mx-5">
                          <DetailImage src={block.imageSrc} alt={block.imageAlt} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveCard(null)}
            aria-label="Close detail"
            className="fixed z-[130] grid h-[2.26rem] w-[2.26rem] place-items-center rounded-full bg-[rgba(236,236,240,1)] text-[rgba(104,104,108,1)] transition-[background-color,color,transform] duration-150 ease-out hover:scale-[1.02]"
            style={{
              right: 'calc(env(safe-area-inset-right, 0px) + 1rem)',
              top: 'calc(env(safe-area-inset-top, 0px) + var(--site-header-height) + 0.65rem)',
            }}
          >
            <span className="photo-viewer-close-icon" aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}

function DetailImage({ src, alt }: { src: string; alt: string }) {
  const [isPortrait, setIsPortrait] = useState(false);
  const isIPadPortraitTouch = useIPadPortraitTouch();

  return (
    <Image
      src={src}
      alt={alt}
      width={1400}
      height={900}
      onLoadingComplete={(img) => {
        setIsPortrait(img.naturalHeight > img.naturalWidth);
      }}
      className={getTravelDetailImageClass({ isPortrait, isIPadPortraitTouch })}
    />
  );
}

function FoodCardContent({ card }: { card: TravelSliderCard }) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [isMultiLineTitle, setIsMultiLineTitle] = useState(false);

  useEffect(() => {
    const heading = titleRef.current;
    if (!heading) return;

    const updateTitleLineState = () => {
      const computedStyle = window.getComputedStyle(heading);
      const lineHeightPx = Number.parseFloat(computedStyle.lineHeight);
      if (!Number.isFinite(lineHeightPx) || lineHeightPx <= 0) return;
      const lineCount = Math.round(heading.scrollHeight / lineHeightPx);
      setIsMultiLineTitle(lineCount >= 2);
    };

    updateTitleLineState();
    const observer = new ResizeObserver(updateTitleLineState);
    observer.observe(heading);

    return () => {
      observer.disconnect();
    };
  }, [card.title]);

  const shouldAnchorImageBottom = card.body.length > 90 || isMultiLineTitle;
  const imageHeightClass = shouldAnchorImageBottom ? 'h-[11.3rem] sm:h-[12.3rem]' : 'h-[12.9rem] sm:h-[14.1rem]';

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <p className="text-[0.85rem] font-semibold tracking-tight text-neutral-900 sm:text-[0.95rem]">{card.eyebrow}</p>
      <h3
        ref={titleRef}
        className={`mt-3 text-[1.3rem] font-semibold tracking-tight text-neutral-900 sm:text-[1.5rem] ${
          isMultiLineTitle ? 'leading-[1.38]' : 'leading-[1.1]'
        }`}
      >
        {card.title}
      </h3>
      <p className="mt-4 text-[0.9rem] leading-[1.52] text-neutral-800 sm:mt-[1.32rem] sm:text-[0.95rem]">{card.body}</p>

      <div className="relative mt-auto overflow-hidden rounded-[1.35rem] bg-[rgba(245,245,247,1)]">
        <Image src={card.imageSrc} alt={card.imageAlt} width={1400} height={900} className={`${imageHeightClass} w-full object-cover`} />
      </div>
    </div>
  );
}
