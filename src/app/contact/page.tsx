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
    <main className="min-h-screen bg-[rgba(245,245,247,1)] px-4 py-10 text-[rgba(29,29,31,1)] sm:px-6 lg:px-8 lg:py-14">
      <section className="mx-auto grid w-full max-w-7xl gap-6 rounded-[2.2rem] bg-[rgba(245,245,247,1)] p-1 sm:p-2 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="flex flex-col gap-6 rounded-[1.7rem] bg-white p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] md:p-7">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.42em] text-[rgba(110,110,115,1)]">Contact</p>
            <h1 className="text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{contactInfo.title}</h1>
            <p className="max-w-md text-base leading-8 text-[rgba(99,99,104,1)]">{contactInfo.intro}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile label="Email" value={contactInfo.email} href={`mailto:${contactInfo.email}`} />
            <InfoTile label="WeChat" value={contactInfo.wechat} />
          </div>

          <div className="rounded-[1.25rem] bg-[rgba(245,245,247,1)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[rgba(110,110,115,1)]">Response time</p>
            <p className="mt-3 text-lg leading-8 text-[rgba(29,29,31,1)]">{contactInfo.responseTime}</p>
          </div>

          <div className="rounded-[1.25rem] bg-[rgba(245,245,247,1)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[rgba(110,110,115,1)]">Expected uses</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {contactInfo.types.map((item) => (
                <span key={item} className="rounded-full bg-white px-3 py-1 text-sm text-[rgba(81,81,84,1)]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm leading-7 text-[rgba(110,110,115,1)]">
            如果你更习惯直接发邮件，也可以通过上面的邮箱联系我。表单提交失败时会自动打开邮件草稿，避免内容丢失。
          </p>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.7rem] bg-white p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] md:p-7">
          <fieldset className="rounded-[1.25rem] bg-[rgba(245,245,247,1)] p-5">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(110,110,115,1)]">Name</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField id="first-name" label="First Name (required)">
                <input
                  id="first-name"
                  name="first_name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  autoComplete="given-name"
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[rgba(29,29,31,1)] outline-none transition focus:shadow-[0_0_0_2px_rgba(29,29,31,0.15)]"
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
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[rgba(29,29,31,1)] outline-none transition focus:shadow-[0_0_0_2px_rgba(29,29,31,0.15)]"
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
                className="w-full rounded-xl bg-[rgba(245,245,247,1)] px-4 py-3 text-sm text-[rgba(29,29,31,1)] outline-none transition focus:bg-white focus:shadow-[0_0_0_2px_rgba(29,29,31,0.15)]"
              />
            </FormField>

            <FormField id="type" label="Type (required)">
              <select
                id="type"
                name="type"
                value={type}
                onChange={(event) => setType(event.target.value)}
                required
                className="w-full rounded-xl bg-[rgba(245,245,247,1)] px-4 py-3 text-sm text-[rgba(29,29,31,1)] outline-none transition focus:bg-white focus:shadow-[0_0_0_2px_rgba(29,29,31,0.15)]"
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
              className="w-full rounded-[1.25rem] bg-[rgba(245,245,247,1)] px-4 py-3 text-sm text-[rgba(29,29,31,1)] outline-none transition focus:bg-white focus:shadow-[0_0_0_2px_rgba(29,29,31,0.15)]"
            />
          </FormField>

          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

          <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={status === 'pending' || !canSubmit}
              className="inline-flex items-center justify-center rounded-full bg-[rgba(29,29,31,1)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
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
                    : 'text-[rgba(110,110,115,1)]'
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
      <label htmlFor={id} className="block text-[11px] font-medium uppercase tracking-[0.2em] text-[rgba(110,110,115,1)]">
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
    <a href={href} className="break-all text-lg font-semibold leading-7 text-[rgba(29,29,31,1)]">
      {value}
    </a>
  ) : (
    <p className="break-all text-lg font-semibold leading-7 text-[rgba(29,29,31,1)]">{value}</p>
  )

  return (
    <div className="rounded-[1.2rem] bg-[rgba(245,245,247,1)] p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[rgba(110,110,115,1)]">{label}</p>
      <div className="mt-2">{content}</div>
    </div>
  )
}
