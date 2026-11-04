import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '页面未找到',
  description: '这个页面不存在，或已经移动到别处。',
  alternates: { canonical: null },
}

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-sm font-medium tracking-[0.3em] text-neutral-500">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950">页面未找到</h1>
      <p className="mt-3 text-base leading-7 text-neutral-600">这个页面不存在，或已经移动到别处。</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
      >
        返回首页
      </Link>
    </main>
  )
}
