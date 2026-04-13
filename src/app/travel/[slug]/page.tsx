import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTravelBySlug, getTravelSlugs } from '@/lib/data/travel';
import { getTravelExpandMapBySlug } from '@/lib/data/travel-card-expand';
import SpotSlider from './SpotSlider';
import FoodSlider from './FoodSlider';

const SPOT_MARGIN_PX = 0;

export async function generateStaticParams() {
  return getTravelSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const travel = await getTravelBySlug(params.slug);

  if (!travel) {
    return {
      title: 'Travel · Zhlin Photography',
    };
  }

  return {
    title: `${travel.cardTitle} · Travel · Zhlin Photography`,
    description: travel.summary,
    openGraph: {
      title: `${travel.cardTitle} · Travel · Zhlin Photography`,
      description: travel.summary,
      images: [travel.hero],
    },
  };
}

export default async function TravelDetailPage({ params }: { params: { slug: string } }) {
  const travel = await getTravelBySlug(params.slug);
  const expandMap = await getTravelExpandMapBySlug(params.slug);

  if (!travel) {
    notFound();
  }
  const displayTitle = travel.cardTitle.replace(/游记/g, '').trim();

  return (
    <main className="min-h-screen bg-[rgba(245, 245, 247, 1)] text-neutral-950">
      <section className="relative isolate min-h-[78vh] overflow-hidden bg-neutral-950 text-white sm:min-h-[82vh] lg:min-h-[88vh]">
        <div className="absolute inset-0">
          <Image
            src={travel.hero}
            alt={travel.cardTitle}
            fill
            className="object-cover object-center opacity-78"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.78)),radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_34%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-6 py-8 sm:min-h-[82vh] sm:py-10 lg:min-h-[88vh] lg:px-8 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)] lg:items-end">
            <div className="pb-2">
              <p className="text-lg font-semibold uppercase tracking-[0.12em] text-white/85 sm:text-xl lg:text-3xl">
                {travel.enName}
              </p>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
                {displayTitle}
              </h1>

              <div className="mt-8 flex flex-wrap gap-3">
                {travel.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/78 backdrop-blur">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[rgba(245,245,247,1)] px-6 py-16 sm:px-[9.4rem] sm:py-20 lg:px-[12.56rem] lg:py-24">
        <div className="mx-auto w-full max-w-[1880px]">
          <h2
            className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl"
            style={{ marginLeft: `${SPOT_MARGIN_PX}px` }}
          >
            景点
          </h2>
          <SpotSlider slug={params.slug} expandMap={expandMap} />
        </div>
      </section>

      {['japan', 'nanjing', 'shanghai', 'beijing', 'dongbei'].includes(params.slug) ? (
        <section className="bg-white px-6 py-16 sm:px-[9.4rem] sm:py-20 lg:px-[12.56rem] lg:py-24">
          <div className="mx-auto w-full max-w-[1880px]">
            <h2
              className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl"
              style={{ marginLeft: `${SPOT_MARGIN_PX}px` }}
            >
              美食
            </h2>
            <FoodSlider slug={params.slug} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
