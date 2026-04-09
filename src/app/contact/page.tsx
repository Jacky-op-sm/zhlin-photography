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
  const [statusText, setStatusText] = useState('')

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
      firstName: firstName.trim(),
      lastName: lastName.trim(),
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
      window.location.href = `mailto:${contactEmail}?subject=${fallbackSubject}&body=${fallbackBody}`
    }
  }

  return (
    <main className="min-h-screen bg-[#f3efe7] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-6xl gap-8 rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:grid-cols-[0.9fr_1.1fr] md:p-8 lg:p-10">
        <aside className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">Contact</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950">Let&apos;s chat.</h1>
          </div>

          <div className="space-y-3 text-sm text-neutral-600">
            <a href={`mailto:${contactEmail}`} className="block text-base text-neutral-900 underline decoration-neutral-300 underline-offset-4">
              {contactEmail}
            </a>
            <p>{contactInfo.responseTime}</p>
            <p>如果你想讨论拍摄、学术或合作，欢迎直接写下你的想法。</p>
          </div>

          <div className="rounded-2xl border border-black/8 bg-[#f8f4ed] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Social</p>
            <p className="mt-3 text-sm text-neutral-700">WeChat: Aluck714</p>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="first-name" label="First Name (required)">
              <input
                id="first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                autoComplete="given-name"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
              />
            </FormField>
            <FormField id="last-name" label="Last Name (required)">
              <input
                id="last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                autoComplete="family-name"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
              />
            </FormField>
          </div>

          <FormField id="email" label="Email (required)">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            />
          </FormField>

          <FormField id="type" label="Type (required)">
            <select
              id="type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              required
              className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            >
              <option value="">请选择类型</option>
              {contactInfo.types.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="message" label="Message (required)">
            <textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={7}
              required
              className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            />
          </FormField>

          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={status === 'pending' || !canSubmit}
              className="rounded-full border border-neutral-950 bg-neutral-950 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'pending' ? 'Sending...' : 'Send'}
            </button>
            <p
              role="status"
              className={`text-sm ${
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
