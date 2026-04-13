import Image from 'next/image';
import Link from 'next/link';
import { getAllTravel } from '@/lib/data/travel';
import type { Travel } from '@/lib/types';

export const metadata = {
  title: 'Travel · Zhlin Photography',
  description: '旅行摄影与城市游记，按南京、杭州、上海、北京、东北、日本整理成 6 城路书。',
};

export default async function TravelPage() {
  const travelEntries = await getAllTravel();
  const sortedTravelEntries = [...travelEntries].sort((a, b) => {
    const byPeriod = getTravelSortValue(b.period) - getTravelSortValue(a.period);
    if (byPeriod !== 0) return byPeriod;
    return a.zhName.localeCompare(b.zhName, 'zh-CN');
  });

  return (
    <main className="min-h-screen bg-[rgba(245,245,247,1)] text-neutral-950">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ul
            className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8 py-8 sm:gap-x-12 sm:gap-y-10 sm:py-12 lg:gap-x-14"
            aria-label="旅行地点快捷导航"
          >
            {sortedTravelEntries.map((travel) => (
              <li key={travel.slug} className="w-[6.5rem] text-center sm:w-[8.25rem]">
                <Link
                  href={`/travel/${travel.slug}`}
                  className="group inline-flex w-full flex-col items-center text-neutral-800"
                  aria-label={`前往 ${travel.zhName} 旅行页`}
                >
                  <span className="travel-nav-thumbnail-shell home-like-hover-shell relative block h-[3.25rem] w-[3.25rem] overflow-hidden rounded-[0.85rem] border border-neutral-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.1)] transition duration-300 sm:h-[4.2rem] sm:w-[4.2rem] sm:rounded-[0.95rem]">
                    <Image
                      src={travel.cover}
                      alt={`${travel.zhName} 缩略图`}
                      fill
                      className="object-cover travel-nav-thumbnail-hover"
                      sizes="(max-width: 640px) 59px, 67px"
                    />
                  </span>
                  <span className="mt-2.5 text-[0.98rem] font-medium leading-tight tracking-[-0.015em] text-neutral-700 sm:mt-3 sm:text-[1.18rem]">
                    {travel.zhName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {sortedTravelEntries.map((travel) => (
            <TravelCard key={travel.slug} travel={travel} />
          ))}
        </div>
      </section>
    </main>
  );
}

const pinyinBySlug: Record<string, string> = {
  nanjing: 'NANJING',
  hangzhou: 'HANGZHOU',
  shanghai: 'SHANGHAI',
  beijing: 'BEIJING',
  dongbei: 'DONGBEI',
  japan: 'JAPAN',
};

function TravelCard({ travel }: { travel: Travel }) {
  const pinyin = pinyinBySlug[travel.slug] ?? travel.enName.toUpperCase();

  return (
    <Link
      href={`/travel/${travel.slug}`}
      className="travel-card-hover-shell group relative block overflow-hidden rounded-[2rem] bg-neutral-950 shadow-[0_12px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_54px_rgba(15,23,42,0.16)]"
    >
      <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[5/4]">
        <Image
          src={travel.cover}
          alt={travel.cardTitle}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.1),rgba(10,10,10,0.04)_30%,rgba(10,10,10,0.72))]" />

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.28)] sm:text-xs">
              {pinyin}
            </p>
            <p className="text-[1.75rem] font-semibold tracking-tight text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.35)] sm:text-[2rem]">
              {travel.zhName}
            </p>
          </div>

          <span className="inline-flex shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition group-hover:translate-x-1">
            阅读更多
          </span>
        </div>
      </div>
    </Link>
  );
}

function getTravelSortValue(period: string): number {
  if (period.includes('至今')) {
    return Number.MAX_SAFE_INTEGER;
  }

  const regex = /(\d{4})\s*年\s*(\d{1,2})\s*月/g;
  let latestYear = 0;
  let latestMonth = 0;
  let match: RegExpExecArray | null = regex.exec(period);

  while (match) {
    latestYear = Number(match[1]);
    latestMonth = Number(match[2]);
    match = regex.exec(period);
  }

  if (latestYear === 0 || latestMonth === 0) {
    return 0;
  }

  return latestYear * 100 + latestMonth;
}
