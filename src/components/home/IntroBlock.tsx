import TextLinkCTA from './TextLinkCTA'

type IntroBlockProps = {
  eyebrow: string
  title: React.ReactNode
  summary: string
  detail?: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
}

export default function IntroBlock({
  eyebrow,
  title,
  summary,
  detail,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: IntroBlockProps) {
  return (
    <div className="max-w-[42rem]">
      <p className="portfolio-eyebrow">{eyebrow}</p>
      <h1 className="mt-6 max-w-[13ch] text-[clamp(2.9rem,8vw,6.4rem)] font-semibold uppercase leading-[0.88] tracking-[-0.055em] text-[color:var(--portfolio-text)]">
        {title}
      </h1>
      <p className="mt-8 max-w-[37rem] text-[1.05rem] leading-8 text-[color:var(--portfolio-muted)] sm:text-[1.12rem]">
        {summary}
      </p>
      {detail ? (
        <p className="mt-5 max-w-[35rem] text-[0.95rem] leading-7 text-[color:var(--portfolio-soft)] sm:text-[0.98rem]">
          {detail}
        </p>
      ) : null}
      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <TextLinkCTA href={primaryHref}>{primaryLabel}</TextLinkCTA>
        {secondaryHref && secondaryLabel ? (
          <TextLinkCTA href={secondaryHref}>{secondaryLabel}</TextLinkCTA>
        ) : null}
      </div>
    </div>
  )
}
