'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { profile } from '@/lib/data/profile'

const SUBSCRIBE_TYPE = '网站更新订阅'

type SubmitState = 'idle' | 'pending' | 'success' | 'error'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [submitMessage, setSubmitMessage] = useState('Sign up with your email to receive updates.')

  const socialLinks = useMemo(() => {
    const links: Array<{ label: string; href: string }> = []

    if (profile.socials.instagram) {
      links.push({ label: 'Instagram', href: profile.socials.instagram })
    }

    if (profile.socials.linkedin) {
      links.push({ label: 'LinkedIn', href: profile.socials.linkedin })
    }

    return links
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim()) {
      setSubmitState('error')
      setSubmitMessage('Please enter a valid email address.')
      return
    }

    setSubmitState('pending')
    setSubmitMessage('Submitting...')

    const payload = {
      name: 'Footer Subscriber',
      firstName: 'Footer',
      lastName: 'Subscriber',
      email: email.trim(),
      type: SUBSCRIBE_TYPE,
      message: `Footer newsletter signup from ${window.location.href}`,
      website: honeypot,
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as { ok?: boolean; error?: string }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Submission failed. Please try again later.')
      }

      setSubmitState('success')
      setSubmitMessage('Thanks. You are now subscribed for updates.')
      setEmail('')
      setHoneypot('')
    } catch (error) {
      setSubmitState('error')
      setSubmitMessage(error instanceof Error ? error.message : 'Submission failed. Please try again later.')
    }
  }

  return (
    <footer className="site-footer">
      <section className="site-footer-band">
        <div className="site-shell site-footer-grid">
          <section className="site-footer-signup" aria-labelledby="footer-signup-title">
            <h2 id="footer-signup-title">Stay in the loop</h2>
            <p>Sign up with your email address to receive new work and updates.</p>

            <form onSubmit={handleSubmit} className="site-footer-form">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="Email Address"
                required
              />
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                className="sr-only"
                aria-hidden="true"
              />
              <button type="submit" disabled={submitState === 'pending'}>
                {submitState === 'pending' ? 'Sending...' : 'Sign Up'}
              </button>
            </form>

            <p
              className={`site-footer-feedback site-footer-feedback--${submitState}`}
              role="status"
              aria-live="polite"
            >
              {submitMessage}
            </p>
          </section>

          <section className="site-footer-brand" aria-label="Brand">
            <h3>zhlin photography.</h3>
            <p>
              Images, journeys, and daily notes. Built from existing materials and reorganized into
              a long-form visual archive.
            </p>
          </section>

          <section className="site-footer-social" aria-label="Social Links">
            <p className="site-footer-social-title">Connect</p>
            <ul>
              <li>
                <a href={`mailto:${profile.email}`}>Email</a>
              </li>
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
              {profile.socials.wechat ? <li>WeChat: {profile.socials.wechat}</li> : null}
            </ul>
            <p className="site-footer-contact-link">
              <Link href="/contact">Need a detailed inquiry? Go to contact page.</Link>
            </p>
          </section>
        </div>
      </section>
    </footer>
  )
}
