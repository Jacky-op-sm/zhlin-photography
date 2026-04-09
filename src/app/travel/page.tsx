import Image from 'next/image';
import Link from 'next/link';
import { getAllTravels } from '@/lib/data/travel';
import type { Travel } from '@/lib/types';

export const metadata = {
  title: 'Travel · Zhlin Photography',
  description: '一些游记与路上的见闻。',
};

export default async function TravelPage() {
  const travels = await getAllTravels();

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {/* 引导区 */}
        <section className="travel-intro">
          <h1 className="travel-heading">Travel</h1>
          <p className="travel-desc">一些游记与路上的见闻。</p>
        </section>

        {/* 旅行卡片网格 */}
        <ul className="travel-grid" aria-label="旅行目的地列表">
          {travels.map((travel) => (
            <li key={travel.slug}>
              <TravelCard travel={travel} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

function TravelCard({ travel }: { travel: Travel }) {
  return (
    <article className="travel-card group">
      <Link
        href={`/travel/${travel.slug}`}
        className="block text-inherit"
        aria-label={`查看 ${travel.cardTitle} 旅行记录`}
      >
        {/* 封面图 */}
        <div className="travel-card-image-wrap">
          <Image
            src={travel.cover}
            alt={`${travel.zhName} 旅行封面`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={false}
          />
          <div className="travel-card-overlay">
            <span className="travel-card-overlay-tag">{travel.period}</span>
            <h2 className="travel-card-overlay-title">{travel.zhName}</h2>
            <span className="travel-card-overlay-sub">{travel.enName}</span>
          </div>
        </div>

        {/* 文字信息 */}
        <div>
          <p className="travel-card-meta">{travel.period}</p>
          <h3 className="travel-card-title">
            {travel.cardTitle}
            {travel.cardSub && (
              <span className="block text-base font-normal mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                {travel.cardSub}
              </span>
            )}
          </h3>
          <p className="travel-card-summary">{travel.summary}</p>
          <span className="travel-card-read">阅读旅行记录 →</span>
        </div>
      </Link>
    </article>
  );
}
