import clsx from 'clsx'

type SectionHeadingProps = {
  marquee: string
  eyebrow: string
  title: string
  description: string
  className?: string
}

export default function SectionHeading({
  marquee,
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <header className={clsx('relative overflow-hidden pb-8 sm:pb-10 lg:pb-12', className)}>
      <p aria-hidden className="portfolio-marquee -left-[0.04em] top-0">
        {marquee}
      </p>
      <div className="relative z-10 flex max-w-3xl flex-col gap-4 pt-10 sm:pt-14 lg:pt-16">
        <p className="portfolio-eyebrow">{eyebrow}</p>
        <h2 className="max-w-[16ch] text-[clamp(2rem,4vw,3.35rem)] font-semibold uppercase leading-[0.96] tracking-[-0.045em] text-[color:var(--portfolio-text)]">
          {title}
        </h2>
        <p className="max-w-[42rem] text-[0.98rem] leading-8 text-[color:var(--portfolio-muted)] sm:text-[1.02rem]">
          {description}
        </p>
      </div>
    </header>
  )
}
