import 'server-only';
import {
  readContentJson,
  readContentJsonFiles,
} from '@/lib/content/read';
import type {
  HobbyContentFile,
  HobbyProfileContent,
} from '@/lib/content/types';
import type { HobbyCategory, MonthlyDigest } from '@/lib/types';

let hobbyCache: HobbyContentFile | null = null;

export function getHobbyContent() {
  if (!hobbyCache) {
    hobbyCache = {
      ...readContentJson<HobbyProfileContent>('hobby', 'profile.json'),
      featured: readContentJson<HobbyCategory[]>('hobby', 'featured.json'),
      cards: readContentJson<HobbyCategory[]>('hobby', 'cards.json'),
      monthlyDigest: readContentJsonFiles<MonthlyDigest>('hobby', 'monthly'),
    };
  }

  return hobbyCache;
}
