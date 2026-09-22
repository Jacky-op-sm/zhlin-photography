import 'server-only';
import {
  readContentJson,
  readContentJsonFiles,
} from '@/lib/content/read';
import {
  hobbyCategorySchema,
  hobbyProfileSchema,
  monthlyDigestSchema,
  type HobbyContent,
} from '@/lib/content/schemas';

let hobbyCache: HobbyContent | null = null;

export function getHobbyContent() {
  if (!hobbyCache) {
    hobbyCache = {
      ...hobbyProfileSchema.parse(readContentJson('hobby', 'profile.json')),
      featured: hobbyCategorySchema
        .array()
        .parse(readContentJson('hobby', 'featured.json')),
      monthlyDigest: monthlyDigestSchema
        .array()
        .parse(readContentJsonFiles('hobby', 'monthly')),
    };
  }

  return hobbyCache;
}
