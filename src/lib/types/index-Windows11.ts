/**
 * 照片分类枚举
 */
export enum PhotoCategory {
  Street = 'street',
  Pets = 'pets',
  Project = 'project',
}

/** 摄影筛选（含「全部」） */
export type PhotographyNavCategory = PhotoCategory | 'all'

/**
 * 摄影分类卡片（首页 / 分类入口）
 */
export interface CategoryInfo {
  id: PhotoCategory;
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
 * 景点
 */
export interface TravelSpot {
  name: string;
  description?: string;
}

/**
 * 单个旅行目的地（卡片展示用）
 */
export interface Travel {
  slug: string;
  zhName: string;
  enName: string;
  period: string;
  cardTitle: string;
  cardSub: string;
  cover: string;          // Unsplash 或外部可访问的 URL
  coverLocal: string;     // 本地路径（在 public 下）
  summary: string;
}

/**
 * 爱好项目
 */
export interface HobbyItem {
  name: string;
  why: string;
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