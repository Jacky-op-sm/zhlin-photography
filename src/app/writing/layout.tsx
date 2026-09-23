import './writing.css'

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  return <main className="writing"><div className="writing-column">{children}</div></main>
}
