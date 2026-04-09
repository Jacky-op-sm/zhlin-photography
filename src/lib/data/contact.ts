import type { ContactInfo } from '../types'
import { profile } from './profile'

export const contactInfo: ContactInfo = {
  title: 'Let’s chat.',
  email: profile.email,
  wechat: profile.socials.wechat,
  intro: '联系我：影像合作、学术交流、创作讨论，都可以从这里开始。',
  responseTime: '通常在 48 小时内回复。',
  types: ['拍摄合作', '学术交流', '其他'],
}

export const contactEmail = profile.email
