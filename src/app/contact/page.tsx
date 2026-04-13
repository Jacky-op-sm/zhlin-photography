'use client'

import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { contactEmail, contactInfo } from '@/lib/data/contact'

type SubmitStatus = 'idle' | 'pending' | 'success' | 'error'

export default function ContactPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [statusText, setStatusText] = useState(contactInfo.responseTime)

  const canSubmit = useMemo(() => {
    return Boolean(firstName.trim() && lastName.trim() && email.trim() && type.trim() && message.trim())
  }, [firstName, lastName, email, type, message])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      setStatus('error')
      setStatusText('请完整填写必填项后再提交。')
      return
    }

    setStatus('pending')
    setStatusText('正在发送，请稍候...')

    const payload = {
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      firstName: firstName.trim(),
      first_name: firstName.trim(),
      lastName: lastName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      type: type.trim(),
      message: message.trim(),
      website: '',
    }

    const fallbackSubject = encodeURIComponent(`[Website Contact] ${payload.type}`)
    const fallbackBody = encodeURIComponent(
      `Name: ${payload.firstName} ${payload.lastName}\nEmail: ${payload.email}\nType: ${payload.type}\n\n${payload.message}`
    )

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as { ok?: boolean; error?: string }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || '提交失败，请稍后重试。')
      }

      setStatus('success')
      setStatusText('提交成功。我们已收到你的消息，将尽快回复。')
      setFirstName('')
      setLastName('')
      setEmail('')
      setType('')
      setMessage('')
      return
    } catch (error) {
      setStatus('error')
      setStatusText(`${error instanceof Error ? error.message : '提交失败，请稍后重试。'} 若问题持续，请使用邮箱直接联系。`)

      try {
        window.location.href = `mailto:${contactEmail}?subject=${fallbackSubject}&body=${fallbackBody}`
      } catch {
        // Ignore environments that block mailto navigation.
      }
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.16),_transparent_24%),linear-gradient(180deg,_#faf7f2_0%,_#f3efe7_100%)] px-4 py-10 text-neutral-950 sm:px-6 lg:px-8 lg:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0))]" />

      <section className="relative mx-auto grid w-full max-w-6xl gap-8 rounded-[2rem] border border-black/10 bg-white/78 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-md md:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:p-10">
        <aside className="flex flex-col gap-6 rounded-[1.75rem] border border-black/8 bg-[#1b1511] p-6 text-[#f6efe6] shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.45em] text-[#d9c3ae]">Contact</p>
            <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">{contactInfo.title}</h1>
            <p className="max-w-md text-base leading-8 text-[#e8ddd2]">
              {contactInfo.intro}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile label="Email" value={contactInfo.email} href={`mailto:${contactInfo.email}`} />
            <InfoTile label="WeChat" value={contactInfo.wechat} />
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d9c3ae]">Response time</p>
            <p className="mt-3 text-lg leading-8 text-white">{contactInfo.responseTime}</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d9c3ae]">Expected uses</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {contactInfo.types.map((item) => (
                <span key={item} className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-sm text-white/85">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm leading-7 text-[#d8c9bc]">
            如果你更习惯直接发邮件，也可以通过上面的邮箱联系我。表单提交失败时会自动打开邮件草稿，避免内容丢失。
          </p>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset className="rounded-[1.5rem] border border-black/8 bg-[#fffaf3] p-5">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.32em] text-neutral-500">
              Name
            </legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField id="first-name" label="First Name (required)">
                <input
                  id="first-name"
                  name="first_name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  autoComplete="given-name"
                  className="w-full rounded-xl border border-black/12 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-950"
                />
              </FormField>

              <FormField id="last-name" label="Last Name (required)">
                <input
                  id="last-name"
                  name="last_name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  autoComplete="family-name"
                  className="w-full rounded-xl border border-black/12 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-950"
                />
              </FormField>
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="email" label="Email (required)">
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-black/12 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-950"
              />
            </FormField>

            <FormField id="type" label="Type (required)">
              <select
                id="type"
                name="type"
                value={type}
                onChange={(event) => setType(event.target.value)}
                required
                className="w-full rounded-xl border border-black/12 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-950"
              >
                <option value="">请选择类型</option>
                {contactInfo.types.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField id="message" label="Message (required)">
            <textarea
              id="message"
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={8}
              required
              className="w-full rounded-[1.25rem] border border-black/12 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-950"
            />
          </FormField>

          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

          <div className="flex flex-col items-start gap-4 pt-4 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={status === 'pending' || !canSubmit}
              className="inline-flex items-center justify-center rounded-full border border-neutral-950 bg-neutral-950 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {status === 'pending' ? 'Sending...' : 'Send'}
            </button>
            <p
              role="status"
              aria-live="polite"
              className={`text-sm leading-7 ${
                status === 'success'
                  ? 'text-emerald-700'
                  : status === 'error'
                    ? 'text-rose-700'
                    : 'text-neutral-500'
              }`}
            >
              {statusText}
            </p>
          </div>
        </form>
      </section>
    </main>
  )
}

function FormField({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </label>
      {children}
    </div>
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
  const content = href ? (
    <a href={href} className="break-all text-lg font-semibold leading-7 text-white underline decoration-white/20 underline-offset-4">
      {value}
    </a>
  ) : (
    <p className="break-all text-lg font-semibold leading-7 text-white">{value}</p>
  )

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[#d9c3ae]">{label}</p>
      <div className="mt-2">{content}</div>
    </div>
  )
}
