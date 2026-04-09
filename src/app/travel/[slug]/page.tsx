import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getTravelBySlug, getTravelSlugs } from '@/lib/data/travel';
import type { Travel, TravelGalleryGroup, TravelSpot } from '@/lib/types';

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
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.8)),radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_34%)]" />
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
            <ContentPanel title="Summary">
              <p className="text-base leading-8 text-neutral-700">{travel.summary}</p>
            </ContentPanel>

            <ContentPanel title="Itinerary">
              <ol className="space-y-4">
                {travel.itinerary.map((item, index) => (
                  <li key={item} className="flex gap-4 rounded-2xl border border-black/8 bg-white/70 p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="pt-1 text-sm leading-7 text-neutral-700">{item}</p>
                  </li>
                ))}
              </ol>
            </ContentPanel>

            <ContentPanel title="Spots">
              <div className="grid gap-4 md:grid-cols-2">
                {travel.spots.map((spot) => (
                  <SpotCard key={spot.name} spot={spot} />
                ))}
              </div>
            </ContentPanel>

            <ContentPanel title="Photo Story">
              <div className="space-y-6">
                <p className="max-w-3xl text-base leading-8 text-neutral-700">{travel.photoStory}</p>
                <Gallery groups={travel.gallery} />
              </div>
            </ContentPanel>

            <ContentPanel title="Reflection">
              <blockquote className="border-l-4 border-neutral-950 pl-5 text-lg leading-9 text-neutral-800">
                {travel.reflection}
              </blockquote>
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
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Tags</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {travel.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-neutral-600">
                    {tag}
                  </span>
                ))}
              </div>
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

function SpotCard({ spot }: { spot: TravelSpot }) {
  return (
    <article className="rounded-2xl border border-black/8 bg-[#fbf8f3] p-5">
      <h3 className="text-lg font-semibold tracking-tight text-neutral-950">{spot.name}</h3>
      <p className="mt-3 text-sm leading-7 text-neutral-600">{spot.description}</p>
    </article>
  );
}

function Gallery({ groups }: { groups: TravelGalleryGroup[] }) {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.title ?? group.images[0]?.src} className="space-y-4">
          {group.title ? (
            <h3 className="text-sm uppercase tracking-[0.35em] text-neutral-400">{group.title}</h3>
          ) : null}
          <div className={galleryLayoutClass(group.layout)}>
            {group.images.map((image) => (
              <figure key={image.src} className="space-y-3">
                <div className={imageWrapperClass(group.layout)}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition duration-500 hover:scale-[1.02]"
                    sizes={gallerySizes(group.layout)}
                  />
                </div>
                {image.caption ? <figcaption className="text-sm leading-6 text-neutral-500">{image.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function galleryLayoutClass(layout: TravelGalleryGroup['layout']) {
  if (layout === 'single') {
    return 'space-y-4';
  }

  if (layout === 'double') {
    return 'grid gap-4 md:grid-cols-2';
  }

  return 'grid gap-4 md:grid-cols-3';
}

function imageWrapperClass(layout: TravelGalleryGroup['layout']) {
  if (layout === 'single') {
    return 'relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-black/10 bg-neutral-200';
  }

  return 'relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-black/10 bg-neutral-200';
}

function gallerySizes(layout: TravelGalleryGroup['layout']) {
  if (layout === 'single') {
    return '100vw';
  }

  if (layout === 'double') {
    return '(max-width: 768px) 100vw, 50vw';
  }

  return '(max-width: 768px) 100vw, 33vw';
}
