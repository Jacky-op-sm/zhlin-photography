import type { ReactNode } from 'react'
import ContactForm from '@/app/contact/ContactForm'
import { getContactInfo } from '@/lib/site/content'
import { buildPageMetadata } from '@/lib/site/metadata'

export const metadata = buildPageMetadata({
  title: '联系',
  description: '通过邮箱、微信或留言表单联系 Zhlin。',
  path: '/contact',
})

export default function ContactPage() {
  const contactInfo = getContactInfo()

  return (
    <main
      className="min-h-screen bg-[rgba(245,245,247,1)] px-4 py-10 text-[rgba(29,29,31,1)] sm:px-6 lg:px-8 lg:py-14"
      data-footer-tone="white"
    >
      <section className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="flex flex-col gap-6 rounded-[1.7rem] p-6 md:p-7">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.2em] text-[rgba(110,110,115,1)]">
              联系方式
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              {contactInfo.title}
            </h1>
            <p className="max-w-md text-base leading-8 text-[rgba(99,99,104,1)]">
              {contactInfo.intro}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile
              label="邮箱"
              value={contactInfo.email}
              href={`mailto:${contactInfo.email}`}
            />
            <InfoTile label="微信" value={contactInfo.wechat} />
          </div>

          <div className="rounded-[1.25rem] bg-white p-5">
            <p className="text-xs tracking-[0.16em] text-[rgba(110,110,115,1)]">
              回复时间
            </p>
            <p className="mt-3 text-lg leading-8 text-[rgba(29,29,31,1)]">
              {contactInfo.responseTime}
            </p>
          </div>

          <div className="rounded-[1.25rem] bg-white p-5">
            <p className="text-xs tracking-[0.16em] text-[rgba(110,110,115,1)]">
              常见用途
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {contactInfo.types.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[rgba(245,245,247,1)] px-3 py-1 text-sm text-[rgba(81,81,84,1)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm leading-7 text-[rgba(110,110,115,1)]">
            如果你更习惯直接发邮件，也可以通过上面的邮箱联系我。
          </p>
        </aside>

        <ContactForm
          contactEmail={contactInfo.email}
          contactTypes={contactInfo.types}
        />
      </section>
    </main>
  )
}

function InfoTile({
  label,
  value,
  href,
}: {
  label: string
  value: string
  href?: string
}) {
  const valueClassName =
    'whitespace-nowrap text-base font-semibold leading-7 text-[rgba(29,29,31,1)] sm:text-[17px]'
  const content: ReactNode = href ? (
    <a href={href} className={valueClassName}>
      {value}
    </a>
  ) : (
    <p className={valueClassName}>{value}</p>
  )

  return (
    <div className="rounded-[1.2rem] bg-white p-4">
      <p className="text-xs tracking-[0.14em] text-[rgba(110,110,115,1)]">
        {label}
      </p>
      <div className="mt-2">{content}</div>
    </div>
  )
}
