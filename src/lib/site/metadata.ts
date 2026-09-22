import type { Metadata } from 'next'

export const SITE_URL = (() => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const url = new URL(configured || 'https://www.zhlin.space')

  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SITE_URL must use https in production')
  }

  return url
})()

export const DEFAULT_OG_IMAGE =
  '/assets/generated/photos/street/Z52_8539-large.webp'

export function getBuildRevision() {
  const revision =
    process.env.NEXT_PUBLIC_BUILD_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    'development'

  return revision === 'development' ? revision : revision.slice(0, 12)
}

export function buildPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: {
  title: string
  description: string
  path: string
  image?: string
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'Zhlin Photography',
      locale: 'zh_CN',
      type: 'website',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
