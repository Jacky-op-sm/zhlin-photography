import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getProfileContent } from '@/lib/site/content'
import {
  DEFAULT_OG_IMAGE,
  getBuildRevision,
  SITE_URL,
} from '@/lib/site/metadata'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: 'Zhlin Photography | 摄影作品集',
    template: '%s · Zhlin Photography',
  },
  description: '个人摄影作品集网站，展示街头摄影、宠物摄影、项目作品和旅行摄影',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Zhlin Photography | 摄影作品集',
    description: '个人摄影作品集网站，展示街头摄影、宠物摄影、项目作品和旅行摄影',
    url: '/',
    siteName: 'Zhlin Photography',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [DEFAULT_OG_IMAGE],
  },
  other: {
    'build-revision': getBuildRevision(),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const profile = getProfileContent()
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL.origin}/#website`,
        url: SITE_URL.origin,
        name: 'Zhlin Photography',
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL.origin}/#person`,
        name: profile.name,
        url: SITE_URL.origin,
        image: new URL(profile.avatar, SITE_URL).href,
        jobTitle: profile.title,
        homeLocation: profile.city,
      },
    ],
  }

  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body className="site-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
        <a href="#main-content" className="skip-link">
          跳到主要内容
        </a>
        <div id="site-root">
          <Header />
          <div id="main-content" className="site-main" tabIndex={-1}>
            {children}
          </div>
          <Footer />
        </div>
        <div id="modal-root" />
      </body>
    </html>
  )
}
