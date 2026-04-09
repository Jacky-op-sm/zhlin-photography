import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getTravelBySlug, getTravelSlugs } from '@/lib/data/travel';

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

  if (!travel) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f3efe7] text-neutral-950">
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0">
          <Image
            src={travel.hero}
            alt={travel.cardTitle}
            fill
            className="object-cover opacity-75"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.82)),radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_34%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-8 sm:py-10 lg:py-14">
          <Link
            href="/travel"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur transition hover:bg-white/15"
          >
            ← 返回 Travel
          </Link>

          <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_24rem] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-white/45">{travel.enName}</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
                {travel.cardTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
                {travel.summary}
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/78">
                {travel.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 bg-white/8 px-4 py-2 backdrop-blur">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-white/12 bg-white/10 p-6 backdrop-blur-xl">
              <dl className="space-y-5 text-sm text-white/78">
                <MetaRow label="Period" value={travel.period} />
                <MetaRow label="Location" value={travel.location} />
                <MetaRow label="Itinerary" value={`${travel.itinerary.length} stops`} />
                <MetaRow label="Gallery" value={`${travel.gallery.length} groups`} />
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <article className="space-y-10">
            <ContentPanel title="原文正文">
              <TravelStory bodyHtml={travel.bodyHtml} />
            </ContentPanel>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-8 self-start">
            <div className="rounded-[1.75rem] border border-black/10 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Overview</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
                {travel.zhName}
              </h2>
              <p className="mt-4 text-sm leading-7 text-neutral-600">
                {travel.location}
              </p>
              <div className="mt-6 space-y-3 text-sm text-neutral-600">
                <p>Period: {travel.period}</p>
                <p>Story blocks: {travel.itinerary.length}</p>
                <p>Spots: {travel.spots.length}</p>
                <p>Gallery groups: {travel.gallery.length}</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-black/10 bg-[#f7f2ea] p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Summary</p>
              <p className="mt-4 text-sm leading-7 text-neutral-700">
                {travel.summary}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-black/10 bg-neutral-950 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">Next</p>
              <p className="mt-3 text-base leading-7 text-white/78">
                如果你想继续看别的城市，可以直接回到 Travel 总览页。
              </p>
              <Link
                href="/travel"
                className="mt-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 transition hover:bg-white/15"
              >
                回到总览
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
      <dt className="text-white/45">{label}</dt>
      <dd className="text-right text-white">{value}</dd>
    </div>
  );
}

function ContentPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-black/10 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">{title}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TravelStory({ bodyHtml }: { bodyHtml: string }) {
  return (
    <div
      className={[
        'travel-story max-w-none text-[1.03rem] leading-8 text-neutral-800',
        '[&_article]:space-y-10',
        '[&_header]:space-y-4',
        '[&_header>h1]:text-4xl [&_header>h1]:font-semibold [&_header>h1]:tracking-tight [&_header>h1]:text-neutral-950',
        '[&_header>p]:text-sm [&_header>p]:leading-7 [&_header>p]:text-neutral-600',
        '[&_figure]:overflow-hidden [&_figure]:rounded-[1.75rem] [&_figure]:border [&_figure]:border-black/10 [&_figure]:bg-neutral-100 [&_figure]:shadow-[0_12px_30px_rgba(15,23,42,0.06)]',
        '[&_img]:block [&_img]:h-auto [&_img]:w-full',
        '[&_figcaption]:px-4 [&_figcaption]:py-3 [&_figcaption]:text-sm [&_figcaption]:leading-6 [&_figcaption]:text-neutral-500',
        '[&_section]:space-y-4 [&_section]:pt-2',
        '[&_section>h2]:text-2xl [&_section>h2]:font-semibold [&_section>h2]:tracking-tight [&_section>h2]:text-neutral-950',
        '[&_section>h3]:text-xl [&_section>h3]:font-semibold [&_section>h3]:tracking-tight [&_section>h3]:text-neutral-950',
        '[&_section>p]:mt-0 [&_section>p]:text-base [&_section>p]:leading-8 [&_section>p]:text-neutral-800',
        '[&_p]:text-base [&_p]:leading-8 [&_p]:text-neutral-800',
        '[&_p.nanjing-rb-channel]:text-xs [&_p.nanjing-rb-channel]:uppercase [&_p.nanjing-rb-channel]:tracking-[0.35em] [&_p.nanjing-rb-channel]:text-neutral-500',
        '[&_p.nanjing-rb-section-index]:text-xs [&_p.nanjing-rb-section-index]:uppercase [&_p.nanjing-rb-section-index]:tracking-[0.35em] [&_p.nanjing-rb-section-index]:text-neutral-400',
        '[&_p.nanjing-rb-separator]:text-center [&_p.nanjing-rb-separator]:tracking-[0.5em] [&_p.nanjing-rb-separator]:text-neutral-400',
        '[&_div.nanjing-rb-break]:my-8 [&_div.nanjing-rb-break]:h-px [&_div.nanjing-rb-break]:bg-black/10',
        '[&_ul]:flex [&_ul]:flex-wrap [&_ul]:gap-2',
        '[&_ul>li]:list-none',
        '[&_ul.nanjing-rb-tags>li]:rounded-full [&_ul.nanjing-rb-tags>li]:border [&_ul.nanjing-rb-tags>li]:border-black/10 [&_ul.nanjing-rb-tags>li]:bg-[#f8f4ed] [&_ul.nanjing-rb-tags>li]:px-3 [&_ul.nanjing-rb-tags>li]:py-1 [&_ul.nanjing-rb-tags>li]:text-xs [&_ul.nanjing-rb-tags>li]:text-neutral-600',
        '[&_div.nanjing-card-grid]:grid [&_div.nanjing-card-grid]:gap-4 [&_div.nanjing-card-grid]:md:grid-cols-2 [&_div.nanjing-card-grid]:xl:grid-cols-3',
        '[&_article.nanjing-card]:rounded-2xl [&_article.nanjing-card]:border [&_article.nanjing-card]:border-black/10 [&_article.nanjing-card]:bg-[#fbf8f3] [&_article.nanjing-card]:p-4 [&_article.nanjing-card]:shadow-sm',
        '[&_article.nanjing-card>h3]:text-lg [&_article.nanjing-card>h3]:font-semibold [&_article.nanjing-card>h3]:tracking-tight [&_article.nanjing-card>h3]:text-neutral-950',
        '[&_article.nanjing-card>p]:mt-3 [&_article.nanjing-card>p]:text-sm [&_article.nanjing-card>p]:leading-7 [&_article.nanjing-card>p]:text-neutral-700',
        '[&_article.nanjing-card[data-food-key]]:cursor-default',
        '[&_section.nanjing-section--appendix]:mt-12 [&_section.nanjing-section--appendix]:rounded-[1.75rem] [&_section.nanjing-section--appendix]:border [&_section.nanjing-section--appendix]:border-black/10 [&_section.nanjing-section--appendix]:bg-[#faf7f1] [&_section.nanjing-section--appendix]:p-6',
      ].join(' ')}
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
}
