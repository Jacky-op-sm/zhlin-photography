import Image from 'next/image'
import Link from 'next/link'
import { getSeriesCoverPhoto, photographySeries } from '@/components/photography/series'
import { getAllPhotos } from '@/lib/data/photos'
import { PhotoCategory } from '@/lib/types'
import type { PhotoCategory as PhotoCategoryType } from '@/lib/types'

type SeriesCategory = Exclude<PhotoCategoryType, typeof PhotoCategory.All>

const seriesZhLabel: Record<SeriesCategory, string> = {
  [PhotoCategory.Street]: '街拍',
  [PhotoCategory.Pets]: '宠物',
  [PhotoCategory.Project]: '项目',
}

const seriesCardCoverOverride: Partial<Record<SeriesCategory, string>> = {
  [PhotoCategory.Street]: '/assets/photos/street/abstract-building.jpg',
  [PhotoCategory.Pets]: '/assets/photos/pets/Z52_3679.jpg',
}

const projectCardCovers = [
  '/assets/photos/project/5.jpg',
  '/assets/photos/project/2.jpg',
  '/assets/photos/project/6.jpg',
]

const streetCardCovers = [
  '/assets/photos/street/street-scene-2.jpg',
  '/assets/photos/street/street-scene-1.jpg',
  '/assets/photos/street/street-scene-3.jpg',
]

const petsCardCovers = [
  '/assets/photos/pets/Z52_2359.jpg',
  '/assets/photos/pets/Z52_3679.jpg',
]

export default async function PhotographyPage() {
  const photos = await getAllPhotos()

  return (
    <main className="photo-index-page">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ul
            className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8 py-8 sm:gap-x-12 sm:gap-y-10 sm:py-12 lg:gap-x-14"
            aria-label="摄影系列快捷导航"
          >
            {photographySeries.map((series) => {
              const previewPhoto = getSeriesCoverPhoto(photos, series.slug)
              const zhLabel = seriesZhLabel[series.slug]

              return (
                <li key={series.slug} className="w-[6.5rem] text-center sm:w-[8.25rem]">
                  <Link
                    href={series.href}
                    className="group inline-flex w-full flex-col items-center text-neutral-800"
                    aria-label={`前往 ${zhLabel} 系列`}
                  >
                    <span className="travel-nav-thumbnail-shell home-like-hover-shell relative block h-[3.25rem] w-[3.25rem] overflow-hidden rounded-[0.85rem] border border-neutral-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.1)] transition duration-300 sm:h-[4.2rem] sm:w-[4.2rem] sm:rounded-[0.95rem]">
                      <Image
                        src={previewPhoto?.thumbnail ?? series.cover}
                        alt={`${zhLabel} 缩略图`}
                        fill
                        className="object-cover travel-nav-thumbnail-hover"
                        sizes="(max-width: 640px) 59px, 67px"
                      />
                    </span>
                    <span className="mt-2.5 text-[0.98rem] font-medium leading-tight tracking-[-0.015em] text-neutral-700 sm:mt-3 sm:text-[1.18rem]">
                      {zhLabel}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="photo-index-series">
        <div className="site-shell photo-index-series-grid">
          {photographySeries.map((series) => {
            const previewPhoto = getSeriesCoverPhoto(photos, series.slug)
            const zhLabel = seriesZhLabel[series.slug]
            const cardCover = seriesCardCoverOverride[series.slug] ?? previewPhoto?.thumbnail ?? series.cover
            const multiCovers =
              series.slug === PhotoCategory.Project
                ? projectCardCovers
                : series.slug === PhotoCategory.Street
                  ? streetCardCovers
                  : series.slug === PhotoCategory.Pets
                    ? petsCardCovers
                  : null

            return (
              <article key={series.slug} className="photo-index-card">
                <Link href={series.href} className="photo-index-card-media-link">
                  <div
                    className={`photo-index-card-media ${
                      series.slug === PhotoCategory.Pets ? 'photo-index-card-media--pets' : ''
                    }`}
                  >
                    {multiCovers ? (
                      <div
                        className={`photo-index-card-media-multi ${
                          series.slug === PhotoCategory.Pets
                            ? 'photo-index-card-media-multi--two'
                            : 'photo-index-card-media-multi--three'
                        }`}
                      >
                        {multiCovers.map((src, index) => (
                          <div key={src} className="photo-index-card-media-triple-item">
                            <Image
                              src={src}
                              alt={`${series.title}-${index + 1}`}
                              fill
                              sizes="(min-width: 1280px) 27vw, (min-width: 768px) 30vw, 95vw"
                              className="object-contain photo-index-card-media-triple-image"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Image
                        src={cardCover}
                        alt={series.title}
                        fill
                        sizes="(min-width: 1280px) 80vw, (min-width: 768px) 80vw, 95vw"
                        className="object-contain"
                      />
                    )}
                    <div className="photo-index-card-overlay">
                      <span className="photo-index-card-overlay-title">{zhLabel}</span>
                      <span className="photo-index-card-overlay-pill">进一步了解</span>
                    </div>
                  </div>
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
