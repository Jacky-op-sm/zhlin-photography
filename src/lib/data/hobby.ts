import { getHobbyContent } from '@/lib/content/hobby';
import type { Hobby } from '../types';

export async function getHobby(): Promise<Hobby> {
  return getHobbyContent();
}
