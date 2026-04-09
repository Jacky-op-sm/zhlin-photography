import { Profile, Socials } from '../lib/types';

/**
 * 个人资料数据（从现有 site-content.json 迁移）
 */
export const profile: Profile = {
  name: 'Zhlin',
  title: 'PhD Student · Photographer',
  city: 'Hangzhou, China',
  email: 'Jackylin714@gmail.com',
  avatar: '/profile/avatar.jpeg',
  aboutParagraphs: [
    '研究方向聚焦 VLA（Vision-Language-Action），关注视觉理解、语言建模与行动决策之间的连接。',
    '摄影以街拍为主，偏爱在日常场景中捕捉真实情绪与城市节奏，记录那些转瞬即逝的细微时刻。',
    '目前常驻浙江杭州，在学习与创作之间持续积累，也希望通过这个网站分享阶段性的观察与作品。',
  ],
  socials: {
    instagram: '',
    linkedin: '',
    wechat: 'Aluck714',
  },
};

/**
 * 获取个人资料
 */
export async function getProfile(): Promise<Profile> {
  return profile;
}

/**
 * 获取社交媒体链接
 */
export async function getSocials(): Promise<Socials> {
  return profile.socials;
}