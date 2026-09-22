import Link from 'next/link'
import { getContactInfo, getFooterNavigation } from '@/lib/site/content'

export default function Footer() {
  const navigation = getFooterNavigation()
  const contactInfo = getContactInfo()

  return (
    <footer className="site-footer">
      <section className="site-footer-band">
        <div className="site-shell site-footer-simple">
          <div className="site-footer-simple-grid">
            {navigation.map((item) => (
              <section
                key={item.id}
                className="site-footer-simple-column"
                aria-label={item.footerLabel ?? item.label}
              >
                <h3>{item.footerLabel ?? item.label}</h3>
                {item.id === 'contact' ? (
                  <ul>
                    <li>微信: {contactInfo.wechat}</li>
                    <li className="site-footer-contact-email">
                      邮箱: {contactInfo.email}
                    </li>
                  </ul>
                ) : (
                  <ul>
                    {item.children?.map((child) => (
                      <li key={child.id}>
                        <Link href={child.href}>
                          {child.footerLabel ?? child.title ?? child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </footer>
  )
}
