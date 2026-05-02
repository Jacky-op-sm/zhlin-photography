import type { HobbyCategory, MonthlyDigest, Photo, Travel } from '@/lib/types';
import type { TravelSliderCard } from '@/lib/types/travel-slider';

export type TravelContentFile = Travel;

export type TravelContentRecord = Travel & {
  bodyHtml: string;
};

export type TravelCardsContentFile = {
  spots: TravelSliderCard[];
  bookstores: TravelSliderCard[];
  food: TravelSliderCard[];
};

export type PhotographyPhotoContent = Omit<Photo, 'category'>;

export type PhotographySeriesContent = {
  slug: 'street' | 'pets' | 'project';
  title: string;
  overline: string;
  landingSummary: string;
  landingDescription: string;
  heroLead: string;
  statement: string[];
  cover: string;
  href: string;
  ctaLabel: string;
  featuredPublications?: {
    title: string;
    description: string;
    image: string;
    href: string;
    ctaLabel: string;
  }[];
};

export type HobbyProfileContent = {
  intro: string;
  externalProfiles: {
    goodreads: string;
    letterboxd: string;
  };
  lolProfile: {
    server: string;
    rank: string;
    mainRoles: string[];
    championPool: string[];
    currentInsight: string;
  };
};

export type HobbyContentFile = HobbyProfileContent & {
  featured: HobbyCategory[];
  cards: HobbyCategory[];
  monthlyDigest: MonthlyDigest[];
};
