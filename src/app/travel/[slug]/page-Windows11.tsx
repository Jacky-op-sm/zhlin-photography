import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllTravels, getTravelBySlug } from '@/lib/data/travel';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const travels = await getAllTravels();
  return travels.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const travel = await getTravelBySlug(slug);
  if (!travel) return {};
  return {
    title: `${travel.zhName} · Travel · Zhlin Photography`,
    description: travel.summary,
  };
}

export default async function TravelDetailPage({ params }: Props) {
  const { slug } = await params;
  const travel = await getTravelBySlug(slug);
  if (!travel) notFound();

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--background)' }}
      data-page={`travel-${slug}`}
    >
      {/* 侧边目录按钮 */}
      <aside className="travel-toc-shell" aria-label="目录">
        <button
          type="button"
          className="travel-toc-toggle"
          id="travel-toc-toggle"
          aria-controls="travel-toc-panel"
          aria-expanded="true"
        >
          <span className="travel-toc-toggle-icon" aria-hidden="true">+</span>
          <span className="travel-toc-toggle-label">关闭目录</span>
        </button>
        <nav className="travel-toc" id="travel-toc-panel" aria-label="目录">
          <p className="travel-toc-title">目录</p>
          <div className="travel-toc-content">
            <div className="travel-toc-progress" aria-hidden="true">
              <span className="travel-toc-progress-bar" id="travel-toc-progress-bar" />
            </div>
            <ol className="travel-toc-list" id="travel-toc-list" />
          </div>
        </nav>
      </aside>

      <div className="travel-roadbook">
        <article>
          {/* 英雄图 */}
          <figure className="travel-rb-hero">
            <Image
              src={travel.cover}
              alt={`${travel.zhName} 旅行封面`}
              width={1400}
              height={800}
              className="w-full"
              style={{ borderRadius: '0.75rem', maxHeight: '72vh', objectFit: 'cover' }}
              priority
            />
          </figure>

          {/* 头部信息 */}
          <header className="travel-rb-header">
            <p className="travel-rb-channel">旅行</p>
            <h1>{travel.cardTitle}</h1>
            <ul className="travel-rb-tags" aria-label="标签">
              <li>{travel.zhName}</li>
              <li>{travel.enName}</li>
              <li>{travel.period}</li>
              <li>摄影</li>
            </ul>
          </header>

          {/* 正文内容区（占位，完整内容见下方说明） */}
          <div
            className="travel-rb-content"
            style={{ maxWidth: '780px', margin: '2.5rem auto 0' }}
          >
            <p style={{ color: 'var(--foreground-secondary)', fontSize: '1.05rem', lineHeight: 1.9 }}>
              {travel.summary}
            </p>
            <div className="travel-rb-break" />
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
              — {travel.enName}, {travel.period}
            </p>
          </div>

          {/* 附录区：人物卡片 */}
          <section className="travel-rb-appendix">
            <div className="travel-rb-appendix-heading">
              <p className="travel-rb-appendix-index">附录 A</p>
              <h2>目的地</h2>
            </div>
            <div className="travel-card-grid">
              <div className="travel-card-item">
                <Image
                  src={travel.cover}
                  alt={travel.zhName}
                  width={400}
                  height={500}
                  style={{ objectFit: 'cover', aspectRatio: '4/5' }}
                />
                <h3>{travel.zhName}</h3>
                <p>{travel.enName} · {travel.period}</p>
              </div>
            </div>
          </section>

          {/* 返回链接 */}
          <div className="travel-backlink">
            <Link href="/travel">← 返回 Travel</Link>
          </div>
        </article>
      </div>
    </main>
  );
}
