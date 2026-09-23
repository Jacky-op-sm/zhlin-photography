import { notFound, redirect } from 'next/navigation'
import { getLatestWritingMetadata } from '@/lib/content/writing'

export default function WritingPage() {
  const latest = getLatestWritingMetadata()
  if (!latest) notFound()
  redirect(`/writing/${latest.slug}`)
}
