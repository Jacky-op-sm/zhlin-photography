'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { archiveUrl, normalizeFilters } from '@/lib/content/writing-model'

const subscribe = () => () => {}
export default function ReturnLink({ slug, periods }: { slug: string; periods: string[] }) {
  const href = useSyncExternalStore(subscribe, () => {
    try {
      const saved = sessionStorage.getItem(`writing-return:${slug}`)
      if (!saved || !/^\/writing(?:\?|$)/.test(saved)) return '/writing'
      return archiveUrl(normalizeFilters(new URLSearchParams(saved.split('?')[1]), periods))
    } catch { return '/writing' }
  }, () => '/writing')
  return <Link className="writing-back" href={href}>← 返回文字</Link>
}
