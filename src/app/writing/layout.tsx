import './writing.css'
import Link from 'next/link'

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  return <main className="writing"><div className="writing-column">{children}<nav className="writing-footer" aria-label="网站导航"><Link href="/">首页</Link><Link href="/writing">文字</Link><Link href="/photography">摄影</Link><Link href="/travel">旅行</Link><Link href="/hobby">爱好</Link></nav></div></main>
}
