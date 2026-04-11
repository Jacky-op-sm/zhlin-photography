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
  const orderedSlugs = ['nanjing', 'hangzhou', 'shanghai', 'beijing', 'dongbei', 'japan'];
  const orderIndex = new Map<string, number>(orderedSlugs.map((slug, index) => [slug, index]));
  const sortedTravelEntries = [...travelEntries].sort((a, b) => {
    return (orderIndex.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (orderIndex.get(b.slug) ?? Number.MAX_SAFE_INTEGER);
  });

  return (
    <main className="min-h-screen bg-[rgba(245,245,245,1)] text-neutral-950">
      <section className="relative overflow-hidden border-b border-black/10 bg-neutral-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.18),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:py-28">
          <p className="text-xs uppercase tracking-[0.45em] text-white/45">Travel</p>
          <div className="mt-6 max-w-4xl space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
              6 城路书，重新整理路上的记忆。
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
              这里把旧站里的南京、杭州、上海、北京、东北和日本重新编排成现代化的旅行页面。
              每一页都保留了原来的叙事气质，同时让阅读、跳转和图片浏览更顺手。
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3 text-sm text-white/68">
            {['南京', '杭州', '上海', '北京', '东北', '日本'].map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/8 px-4 py-2 backdrop-blur">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:py-20">
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
      className="group relative block overflow-hidden rounded-[2rem] border border-black/10 bg-neutral-950 shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_54px_rgba(15,23,42,0.16)]"
    >
      <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[5/4]">
        <Image
          src={travel.cover}
          alt={travel.cardTitle}
          fill
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.1),rgba(10,10,10,0.04)_30%,rgba(10,10,10,0.72))]" />

        <div className="absolute left-5 top-5 z-10">
          <span className="inline-flex rounded-full border border-white/50 bg-white/[0.18] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] backdrop-blur-md">
            {travel.period}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-white/82 drop-shadow-[0_4px_16px_rgba(0,0,0,0.28)] sm:text-xs">
              {pinyin}
            </p>
            <p className="text-[1.75rem] font-semibold tracking-tight text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.35)] sm:text-[2rem]">
              {travel.zhName}
            </p>
          </div>

          <span className="inline-flex shrink-0 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition group-hover:translate-x-1">
            阅读更多
          </span>
        </div>
      </div>
    </Link>
  );
}
