import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <section className="site-footer-band">
        <div className="site-shell site-footer-simple">
          <div className="site-footer-simple-grid">
            <section className="site-footer-simple-column" aria-label="摄影">
              <h3>摄影</h3>
              <ul>
                <li>
                  <Link href="/photography">总览</Link>
                </li>
                <li>
                  <Link href="/photography?category=street">街拍</Link>
                </li>
                <li>
                  <Link href="/photography?category=pets">动物</Link>
                </li>
                <li>
                  <Link href="/photography?category=project">项目</Link>
                </li>
              </ul>
            </section>

            <section className="site-footer-simple-column" aria-label="旅行">
              <h3>旅行</h3>
              <ul>
                <li>
                  <Link href="/travel">总览</Link>
                </li>
                <li>
                  <Link href="/travel/nanjing">南京</Link>
                </li>
                <li>
                  <Link href="/travel/hangzhou">杭州</Link>
                </li>
                <li>
                  <Link href="/travel/shanghai">上海</Link>
                </li>
                <li>
                  <Link href="/travel/beijing">北京</Link>
                </li>
                <li>
                  <Link href="/travel/dongbei">东北</Link>
                </li>
                <li>
                  <Link href="/travel/japan">日本</Link>
                </li>
              </ul>
            </section>

            <section className="site-footer-simple-column" aria-label="爱好">
              <h3>爱好</h3>
              <ul>
                <li>
                  <Link href="/hobby#reading">阅读</Link>
                </li>
                <li>
                  <Link href="/hobby#film">电影</Link>
                </li>
                <li>
                  <Link href="/hobby#game">游戏</Link>
                </li>
              </ul>
            </section>

            <section className="site-footer-simple-column" aria-label="联系">
              <h3>联系</h3>
              <ul>
                <li>微信: Aluck714</li>
                <li className="site-footer-contact-email">邮箱: Jackylin714@gmail.com</li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </footer>
  )
}
