/**
 * 照片分类常量和值类型
 */
export const PhotoCategory = {
  All: 'all',
  Street: 'street',
  Pets: 'pets',
  Project: 'project',
} as const;

export type PhotoCategory = (typeof PhotoCategory)[keyof typeof PhotoCategory];

/**
 * 摄影分类卡片信息
 */
export interface CategoryInfo {
  id: Exclude<PhotoCategory, 'all'>;
  name: string;
  description: string;
  coverImage: string;
}

/**
 * 照片接口
 */
export interface Photo {
  id: string;
  category: PhotoCategory;
  title: string;
  description: string;
  filename: string;
  thumbnail: string;
  width: number;
  height: number;
  takenAt: string;
  location: string;
  tags: string[];
}

/**
 * 社交媒体链接
 */
export interface Socials {
  instagram: string;
  linkedin: string;
  wechat: string;
}

/**
 * 个人资料接口
 */
export interface Profile {
  name: string;
  title: string;
  city: string;
  email: string;
  avatar: string;
  aboutParagraphs: string[];
  socials: Socials;
}

/**
 * 旅行日记项
 */
export interface TravelDay {
  day: string;
  description: string;
}

/**
 * 旅行照片
 */
export interface TravelImage {
  src: string;
  alt: string;
  caption?: string;
}

/**
 * 旅行图组布局
 */
export type TravelGalleryLayout = 'single' | 'double' | 'triple';

/**
 * 旅行图组
 */
export interface TravelGalleryGroup {
  title?: string;
  layout: TravelGalleryLayout;
  images: TravelImage[];
}

/**
 * 旅行正文块
 */
export interface TravelStorySection {
  eyebrow?: string;
  title?: string;
  paragraphs: string[];
}

/**
 * 景点
 */
export interface TravelSpot {
  name: string;
  description: string;
}

/**
 * 旅行内容
 */
export interface Travel {
  slug: string;
  zhName: string;
  enName: string;
  period: string;
  location: string;
  cardTitle: string;
  cover: string;
  hero: string;
  summary: string;
  tags: string[];
  itinerary: string[];
  spots: TravelSpot[];
  storySections?: TravelStorySection[];
  photoStory: string;
  reflection: string;
  gallery: TravelGalleryGroup[];
}

/**
 * 旅行内容集合
 */
export interface TravelCollection {
  travel: Travel[];
}

/**
 * 爱好项目
 */
export interface HobbyItem {
  name: string;
  why: string;
  fullWhy?: string;
  rating?: string;
  date?: string;
}

/**
 * 爱好分类
 */
export interface HobbyCategory {
  title: string;
  items: HobbyItem[];
}

/**
 * 月度摘要
 */
export interface MonthlyDigest {
  month: string;
  reading: HobbyItem[];
  films: HobbyItem[];
}

/**
 * 外部个人资料
 */
export interface ExternalProfiles {
  goodreads: string;
  letterboxd: string;
}

/**
 * LOL 玩家资料
 */
export interface LolProfile {
  server: string;
  rank: string;
  mainRoles: string[];
  championPool: string[];
  currentInsight: string;
}

/**
 * 爱好数据
 */
export interface Hobby {
  intro: string;
  externalProfiles: ExternalProfiles;
  lolProfile: LolProfile;
  featured: HobbyCategory[];
  monthlyDigest: MonthlyDigest[];
  cards: HobbyCategory[];
}

/**
 * 联系页信息
 */
export interface ContactInfo {
  title: string;
  email: string;
  wechat: string;
  intro: string;
  responseTime: string;
  types: string[];
}

/**
 * 联系表单提交数据
 */
export interface ContactPayload {
  name?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email: string;
  type: string;
  message: string;
  website?: string;
}
