import Image from 'next/image'
import { getProfile } from '@/lib/data/profile'

export default async function Home() {
  const profile = await getProfile()

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800">
        <div className="text-center text-white px-4 max-w-3xl mx-auto">
          {/* Avatar */}
          <div className="mb-8">
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-4 border-white/20">
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Name & Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {profile.name}
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 mb-2">
            {profile.title}
          </p>
          <p className="text-neutral-400 text-sm">
            {profile.city}
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-8 text-center">
            About Me
          </h2>
          <div className="space-y-6">
            {profile.aboutParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-lg text-neutral-700 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 bg-neutral-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-8 text-center">
            探索更多
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickLinkCard
              title="Photography"
              description="街头、宠物与项目摄影作品"
              href="/photography"
              emoji="📷"
            />
            <QuickLinkCard
              title="Travel"
              description="旅行途中的记录与故事"
              href="/travel"
              emoji="✈️"
            />
            <QuickLinkCard
              title="Contact"
              description="欢迎与我联系"
              href="/contact"
              emoji="📧"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function QuickLinkCard({
  title,
  description,
  href,
  emoji,
}: {
  title: string
  description: string
  href: string
  emoji: string
}) {
  return (
    <a
      href={href}
      className="block p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
    >
      <span className="text-3xl mb-4 block">{emoji}</span>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {title}
      </h3>
      <p className="text-neutral-600 text-sm">
        {description}
      </p>
    </a>
  )
}
