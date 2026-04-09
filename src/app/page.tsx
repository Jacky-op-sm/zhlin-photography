import Image from 'next/image'
import Link from 'next/link'
import { getProfile } from '@/lib/data/profile'

const heroFrames = [
  {
    src: '/assets/photos/street/west-lake-rain.jpeg',
    alt: 'Rain over West Lake',
    label: 'Street / atmosphere',
    caption: 'Rain, water, and the soft blur of a city pausing for a moment.',
    aspectClass: 'aspect-[4/5]',
    className: 'lg:col-span-7',
  },
  {
    src: '/assets/photos/project/1.jpg',
    alt: 'Project image one',
    label: 'Project / structure',
    caption: 'A more graphic reading of daily space and architectural rhythm.',
    aspectClass: 'aspect-[4/5]',
    className: 'lg:col-span-5',
  },
  {
    src: '/assets/photos/street/school-light.jpeg',
    alt: 'School light and shadows',
    label: 'Street / light',
    caption: 'Warm classroom light moving through surfaces and frames.',
    aspectClass: 'aspect-[16/10]',
    className: 'lg:col-span-6',
  },
  {
    src: '/assets/photos/pets/Z52_6041.jpg',
    alt: 'Pet portrait',
    label: 'Pets / close-up',
    caption: 'A smaller, quieter register for the same observational habit.',
    aspectClass: 'aspect-[16/10]',
    className: 'lg:col-span-6',
  },
]

const navigationCards = [
  {
    title: 'Photography',
    href: '/photography',
    image: '/assets/photos/street/abstract-building.jpeg',
    description: 'Street, pets, and project work arranged as a living archive.',
  },
  {
    title: 'Travel',
    href: '/travel',
    image: '/assets/photos/street/west-lake-rain.jpeg',
    description: 'Long-form city notes, route fragments, and visual diaries.',
  },
  {
    title: 'Hobby',
    href: '/hobby',
    image: '/assets/photos/project/3.jpg',
    description: 'Reading, film, and other ongoing sources of observation.',
  },
  {
    title: 'Contact',
    href: '/contact',
    image: '/assets/photos/pets/Z52_2306.jpg',
    description: 'Open for collaboration, conversation, and shared projects.',
  },
]

export default async function Home() {
  const profile = await getProfile()

  return (
    <div className="relative overflow-hidden bg-[#f4eee4] text-[#1b1511]">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(214,174,131,0.25),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(86,73,62,0.18),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(244,238,228,0))]" />

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="space-y-8">
            <div className="flex max-w-2xl items-center gap-4 rounded-[1.75rem] border border-[#d7c9bd] bg-[#fffaf3]/90 p-4 shadow-[0_16px_36px_rgba(35,26,17,0.08)]">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[#d7c9bd] bg-[#efe7db]">
                <Image
                  src={profile.avatar}
                  alt={`${profile.name} portrait`}
                  fill
                  priority
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#756459]">
                  Profile
                </p>
                <p className="mt-1 truncate text-xl font-semibold tracking-[-0.04em] text-[#17110d]">
                  {profile.name}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#5a4f46]">
                  {profile.title} · {profile.city}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-[0.7rem] uppercase tracking-[0.45em] text-[#756459]">
                Zhlin Photography
              </p>
              <h1 className="max-w-3xl text-5xl font-semibold uppercase leading-[0.88] tracking-[-0.08em] text-[#17110d] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
                A visual journal of light, travel, and daily obsessions.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[#4d433a] md:text-lg">
                {profile.aboutParagraphs[0]} {profile.aboutParagraphs[1]}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/photography"
                className="inline-flex items-center justify-center rounded-full border border-[#1b1511] bg-[#1b1511] px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-[#f6efe6] transition-transform duration-200 hover:-translate-y-0.5"
              >
                Explore Photography
              </Link>
              <Link
                href="/travel"
                className="inline-flex items-center justify-center rounded-full border border-[#b8a392] px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-[#1b1511] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#8f7966]"
              >
                Travel Notes
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-transparent px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-[#6c584a] underline underline-offset-8 transition-colors hover:text-[#1b1511]"
              >
                Contact
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoChip label="Base" value={profile.city} />
              <InfoChip label="Focus" value="Street / Travel / Hobby" />
              <InfoChip label="Role" value={profile.title} />
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-3 sm:grid-cols-12">
              <figure className="relative overflow-hidden rounded-[2rem] border border-[#d7c9bd] bg-[#efe7db] shadow-[0_24px_60px_rgba(35,26,17,0.14)] sm:col-span-7">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={heroFrames[0].src}
                    alt={heroFrames[0].alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-t border-[#d7c9bd] bg-[#f5efe7] px-5 py-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.3em] text-[#7a6759]">
                    {heroFrames[0].label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#4d433a]">
                    {heroFrames[0].caption}
                  </p>
                </figcaption>
              </figure>

              <div className="sm:col-span-5 grid gap-3">
                {heroFrames.slice(1, 3).map((frame) => (
                  <figure
                    key={frame.src}
                    className="relative overflow-hidden rounded-[2rem] border border-[#d7c9bd] bg-[#efe7db] shadow-[0_24px_60px_rgba(35,26,17,0.10)]"
                  >
                    <div className={`relative ${frame.aspectClass}`}>
                      <Image
                        src={frame.src}
                        alt={frame.alt}
                        fill
                        sizes="(min-width: 1024px) 24vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="border-t border-[#d7c9bd] bg-[#f5efe7] px-4 py-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#7a6759]">
                        {frame.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#4d433a]">
                        {frame.caption}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-12">
              <figure className="relative overflow-hidden rounded-[2rem] border border-[#d7c9bd] bg-[#efe7db] shadow-[0_24px_60px_rgba(35,26,17,0.10)] sm:col-span-7">
                <div className={`relative ${heroFrames[2].aspectClass}`}>
                  <Image
                    src={heroFrames[2].src}
                    alt={heroFrames[2].alt}
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-t border-[#d7c9bd] bg-[#f5efe7] px-5 py-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.3em] text-[#7a6759]">
                    {heroFrames[2].label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#4d433a]">
                    {heroFrames[2].caption}
                  </p>
                </figcaption>
              </figure>

              <figure className="relative overflow-hidden rounded-[2rem] border border-[#d7c9bd] bg-[#efe7db] shadow-[0_24px_60px_rgba(35,26,17,0.10)] sm:col-span-5">
                <div className={`relative ${heroFrames[3].aspectClass}`}>
                  <Image
                    src={heroFrames[3].src}
                    alt={heroFrames[3].alt}
                    fill
                    sizes="(min-width: 1024px) 28vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-t border-[#d7c9bd] bg-[#f5efe7] px-5 py-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.3em] text-[#7a6759]">
                    {heroFrames[3].label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#4d433a]">
                    {heroFrames[3].caption}
                  </p>
                </figcaption>
              </figure>
            </div>

            <div className="mt-4 rounded-[1.75rem] border border-[#d7c9bd] bg-[#fffaf3]/90 px-5 py-4 shadow-[0_18px_40px_rgba(35,26,17,0.08)] backdrop-blur">
              <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[#756459]">
                Current base
              </p>
              <div className="mt-2 flex flex-col gap-2 text-sm text-[#4d433a] sm:flex-row sm:items-center sm:justify-between">
                <span>{profile.city}</span>
                <span>{profile.title}</span>
                <a
                  href={`mailto:${profile.email}`}
                  className="font-medium text-[#1b1511] underline decoration-[#bca48f] underline-offset-4"
                >
                  {profile.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="border-t border-[#cdbfb2] pt-10 lg:pt-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-[0.7rem] uppercase tracking-[0.45em] text-[#756459]">
                Selected chapters
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-[#17110d] md:text-4xl lg:text-5xl">
                A site map that behaves like a magazine spread.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5a4f46] md:text-base">
              The navigation stays intact, but the landing page now gives each
              section a stronger visual entry point and a clearer editorial cue.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {navigationCards.map((card, index) => (
              <Link
                key={card.href}
                href={card.href}
                className="group overflow-hidden rounded-[1.75rem] border border-[#d7c9bd] bg-[#fffaf3] shadow-[0_18px_40px_rgba(35,26,17,0.08)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120d0a]/72 via-[#120d0a]/15 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[0.62rem] uppercase tracking-[0.35em] text-white backdrop-blur">
                    0{index + 1}
                  </div>
                </div>

                <div className="space-y-3 px-5 py-5">
                  <div className="space-y-2">
                    <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#7a6759]">
                      {card.title}
                    </p>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#17110d]">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-7 text-[#5a4f46]">
                    {card.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-[#17110d]">
                    Enter section
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid gap-8 rounded-[2rem] border border-[#d7c9bd] bg-[#fffaf3] p-6 shadow-[0_24px_60px_rgba(35,26,17,0.08)] lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[0.7rem] uppercase tracking-[0.45em] text-[#756459]">
                About
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#17110d] md:text-4xl">
                What I keep returning to.
              </h2>
            </div>
            <div className="space-y-5">
              {profile.aboutParagraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="max-w-3xl text-base leading-8 text-[#4d433a] md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-[#d7c9bd] bg-[#f4ede4] p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#7a6759]">
                Current lens
              </p>
              <p className="mt-3 text-lg leading-8 text-[#1b1511]">
                Research in VLA, street photography, and image-driven note taking
                continue to shape the way this site grows.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[#d7c9bd] bg-[#1b1511] p-5 text-[#f6efe6]">
              <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#d9c3ae]">
                Contact
              </p>
              <p className="mt-3 text-lg leading-8">
                Open to collaboration, photography conversations, and project
                exchange.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center justify-center rounded-full border border-[#f6efe6]/30 px-4 py-2 text-sm font-medium text-[#f6efe6] transition-colors hover:bg-[#f6efe6] hover:text-[#1b1511]"
                >
                  Email
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-[#f6efe6]/30 px-4 py-2 text-sm font-medium text-[#f6efe6] transition-colors hover:bg-[#f6efe6] hover:text-[#1b1511]"
                >
                  Open contact page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-[#d7c9bd] bg-[#fffaf3]/90 px-4 py-4 shadow-[0_10px_24px_rgba(35,26,17,0.06)]">
      <p className="text-[0.65rem] uppercase tracking-[0.32em] text-[#7a6759]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#1b1511]">{value}</p>
    </div>
  )
}
