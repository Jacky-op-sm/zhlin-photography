import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zhlin Photography | 摄影作品集',
  description: '个人摄影作品集网站，展示街头摄影、宠物摄影、项目作品和旅行摄影',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700&family=Archivo+Black&display=swap"
        />
      </head>
      <body className="site-body">
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
