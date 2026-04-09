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
    <main className="min-h-screen bg-[#f3efe7] text-neutral-950">
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

function TravelCard({ travel }: { travel: Travel }) {
  return (
    <Link
      href={`/travel/${travel.slug}`}
      className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
    >
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e1d4] p-4 lg:aspect-auto lg:min-h-[22rem] lg:p-5">
          <Image
            src={travel.cover}
            alt={travel.cardTitle}
            fill
            className="object-contain transition duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-white/80">
            <span className="rounded-full border border-white/15 bg-black/25 px-3 py-2 backdrop-blur">{travel.period}</span>
          </div>
        </div>

        <div className="flex flex-col p-6 sm:p-7 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">{travel.enName}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                {travel.cardTitle}
              </h2>
            </div>
            <span className="rounded-full border border-black/10 bg-black/3 px-3 py-2 text-xs uppercase tracking-[0.3em] text-neutral-500">
              {travel.zhName}
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-black/8 pt-4 text-sm text-neutral-500">
            <span>{travel.gallery.length} 组图</span>
            <span className="text-xs uppercase tracking-[0.3em]">Travel</span>
          </div>

          <div className="mt-auto pt-8 text-sm font-medium text-neutral-950 transition group-hover:translate-x-1">
            阅读详情 →
          </div>
        </div>
      </div>
    </Link>
  );
}
