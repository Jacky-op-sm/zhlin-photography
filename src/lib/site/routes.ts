import navigationData from '../../../content/site/navigation.json'
import { navigationSchema, type NavigationItem } from '@/lib/content/schemas'
import { isPublicPath } from '@/lib/site/visibility.mjs'

export function collectPublicPaths(items: NavigationItem[]): string[] {
  return items.filter((item) => isPublicPath(item.href)).flatMap((item) => [
    item.href.split('#')[0],
    ...(item.children ? collectPublicPaths(item.children) : []),
  ])
}

export const publicPaths = [...new Set(
  [
    ...collectPublicPaths(navigationSchema.parse(navigationData) as NavigationItem[]),
    '/photography/bangkok',
  ],
)]

export const primaryAuditPaths = ([
  '/',
  '/photography',
  '/photography/street',
  '/travel',
  '/hobby',
  '/contact',
] as const).filter(isPublicPath)

export const desktopVisualPaths = ([
  { path: '/', name: 'home' },
  { path: '/photography', name: 'photography-index' },
  { path: '/travel', name: 'travel-index' },
  { path: '/hobby', name: 'hobby' },
] as const).filter((entry) => isPublicPath(entry.path))
