import type { ContactInfo } from '../types'
import { profile } from './profile'

export const contactInfo: ContactInfo = {
  title: '欢迎联系',
  email: profile.email,
  wechat: profile.socials.wechat,
  intro: '有任何想说的，都可以从这里开始。',
  responseTime: '通常在 48 小时内回复。',
  types: ['评论', '拍摄合作', '学术交流'],
}

export const contactEmail = profile.email
