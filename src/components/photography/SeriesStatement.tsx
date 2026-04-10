import SectionOverline from './SectionOverline'

interface SeriesStatementProps {
  label?: string
  title?: string
  paragraphs: string[]
}

export default function SeriesStatement({
  label = 'Series statement',
  title,
  paragraphs,
}: SeriesStatementProps) {
  return (
    <section className="photography-section">
      <div className="photography-shell grid gap-6 lg:grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)] lg:gap-10">
        <div>
          <SectionOverline>{label}</SectionOverline>
          {title && (
            <h2 className="mt-4 text-2xl font-semibold tracking-tight lg:text-3xl">
              {title}
            </h2>
          )}
        </div>

        <div className="max-w-[var(--photography-body-width)]">
          {paragraphs.map((paragraph, index) => (
            <p
              key={paragraph}
              className={`photography-body ${index === 0 ? 'mt-0' : 'mt-5'}`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

