import { NextResponse } from 'next/server'
import { getBuildRevision } from '@/lib/site/metadata'

export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json(
    {
      revision: getBuildRevision(),
      environment:
        process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=300',
      },
    },
  )
}
