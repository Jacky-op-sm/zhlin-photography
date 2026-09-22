'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CONTACT_FIELD_LIMITS } from '@/lib/contact/constants'
import type {
  ContactApiResponse,
  ContactFormInput,
} from '@/lib/contact/types'

type SubmitStatus = 'idle' | 'pending' | 'success' | 'error'

const INITIAL_FORM: ContactFormInput = {
  firstName: '',
  lastName: '',
  email: '',
  type: '',
  message: '',
  website: '',
}

export default function ContactForm({
  contactEmail,
  contactTypes,
}: {
  contactEmail: string
  contactTypes: string[]
}) {
  const [form, setForm] = useState<ContactFormInput>(INITIAL_FORM)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [statusText, setStatusText] = useState('')

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.firstName.trim()
          && form.lastName.trim()
          && form.email.trim()
          && form.type.trim()
          && form.message.trim(),
      ),
    [form],
  )

  const fallbackHref = useMemo(() => {
    const subject = encodeURIComponent(`[网站联系] ${form.type || '留言'}`)
    const body = encodeURIComponent(
      `姓名: ${form.firstName} ${form.lastName}\n邮箱: ${form.email}\n类型: ${form.type}\n\n${form.message}`,
    )
    return `mailto:${contactEmail}?subject=${subject}&body=${body}`
  }, [contactEmail, form])

  function updateField<K extends keyof ContactFormInput>(
    key: K,
    value: ContactFormInput[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'pending') return

    if (!canSubmit) {
      setStatus('error')
      setStatusText('请完整填写必填项后再提交。')
      return
    }

    setStatus('pending')
    setStatusText('正在发送，请稍候……')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          type: form.type.trim(),
          message: form.message.trim(),
          website: form.website.trim(),
        } satisfies ContactFormInput),
      })

      const result = (await response
        .json()
        .catch(() => null)) as ContactApiResponse | null

      if (!response.ok || !result?.ok) {
        throw new Error(
          result && !result.ok
            ? result.error
            : '提交失败，请稍后重试。',
        )
      }

      setStatus('success')
      setStatusText('提交成功。你的消息已经送达。')
      setForm(INITIAL_FORM)
    } catch (error) {
      setStatus('error')
      setStatusText(
        error instanceof Error
          ? error.message
          : '提交失败，请稍后重试。',
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[1.7rem] p-6 text-left md:p-7"
      aria-describedby="contact-form-status"
    >
      <fieldset className="rounded-[1.25rem] bg-white p-5">
        <legend className="px-1 text-xs font-semibold tracking-[0.18em] text-[rgba(110,110,115,1)]">
          姓名
        </legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField id="first-name" label="名（必填）">
            <input
              id="first-name"
              name="firstName"
              value={form.firstName}
              onChange={(event) =>
                updateField('firstName', event.target.value)
              }
              required
              maxLength={CONTACT_FIELD_LIMITS.firstName}
              autoComplete="given-name"
              className="h-12 w-full rounded-[1rem] border border-[rgba(208,208,214,1)] bg-white px-4 text-[15px] text-[rgba(29,29,31,1)] outline-none transition focus:border-[rgba(29,29,31,0.36)] focus:shadow-[0_0_0_2px_rgba(29,29,31,0.08)]"
            />
          </FormField>

          <FormField id="last-name" label="姓（必填）">
            <input
              id="last-name"
              name="lastName"
              value={form.lastName}
              onChange={(event) =>
                updateField('lastName', event.target.value)
              }
              required
              maxLength={CONTACT_FIELD_LIMITS.lastName}
              autoComplete="family-name"
              className="h-12 w-full rounded-[1rem] border border-[rgba(208,208,214,1)] bg-white px-4 text-[15px] text-[rgba(29,29,31,1)] outline-none transition focus:border-[rgba(29,29,31,0.36)] focus:shadow-[0_0_0_2px_rgba(29,29,31,0.08)]"
            />
          </FormField>
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="email" label="邮箱（必填）" card>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            required
            maxLength={CONTACT_FIELD_LIMITS.email}
            autoComplete="email"
            className="h-12 w-full rounded-[1rem] border border-[rgba(208,208,214,1)] bg-white px-4 text-[15px] text-[rgba(29,29,31,1)] outline-none transition focus:border-[rgba(29,29,31,0.36)] focus:shadow-[0_0_0_2px_rgba(29,29,31,0.08)]"
          />
        </FormField>

        <FormField id="type" label="类型（必填）" card>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={(event) => updateField('type', event.target.value)}
            required
            className="h-12 w-full rounded-[1rem] border border-[rgba(208,208,214,1)] bg-white px-4 text-left text-[15px] text-[rgba(29,29,31,1)] outline-none transition focus:border-[rgba(29,29,31,0.36)] focus:shadow-[0_0_0_2px_rgba(29,29,31,0.08)]"
          >
            <option value="">请选择类型</option>
            {contactTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField id="message" label="留言内容（必填）" card>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={(event) => updateField('message', event.target.value)}
          rows={8}
          required
          maxLength={CONTACT_FIELD_LIMITS.message}
          className="w-full rounded-[1.25rem] border border-[rgba(208,208,214,1)] bg-white px-4 py-3 text-[15px] text-[rgba(29,29,31,1)] outline-none transition focus:border-[rgba(29,29,31,0.36)] focus:shadow-[0_0_0_2px_rgba(29,29,31,0.08)]"
        />
      </FormField>

      <div
        aria-hidden="true"
        className="absolute -left-[10000px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">网站</label>
        <input
          id="website"
          type="text"
          name="website"
          value={form.website}
          onChange={(event) => updateField('website', event.target.value)}
          tabIndex={-1}
          maxLength={CONTACT_FIELD_LIMITS.website}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col items-start gap-3 pt-2">
        <button
          type="submit"
          disabled={status === 'pending' || !canSubmit}
          className="inline-flex items-center justify-center rounded-full bg-[rgba(29,29,31,1)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'pending' ? '发送中…' : '发送'}
        </button>

        <div className="min-h-7 text-sm leading-7 text-[rgba(81,81,84,1)]">
          {statusText ? (
            <p
              id="contact-form-status"
              role={status === 'error' ? 'alert' : 'status'}
              aria-live={status === 'error' ? 'assertive' : 'polite'}
            >
              {statusText}
              {status === 'error' ? (
                <>
                  {' '}
                  <a
                    href={fallbackHref}
                    className="underline underline-offset-4"
                  >
                    改用邮箱发送
                  </a>
                </>
              ) : null}
            </p>
          ) : (
            <p id="contact-form-status" aria-hidden="true">
              &nbsp;
            </p>
          )}
        </div>
      </div>
    </form>
  )
}

function FormField({
  id,
  label,
  card = false,
  children,
}: {
  id: string
  label: string
  card?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`space-y-2 text-left ${
        card ? 'rounded-[1.25rem] bg-white p-5' : ''
      }`}
    >
      <label
        htmlFor={id}
        className="block text-[11px] font-semibold tracking-[0.12em] text-[rgba(110,110,115,1)]"
      >
        {label}
      </label>
      {children}
    </div>
  )
}
