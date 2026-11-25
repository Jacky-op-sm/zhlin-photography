/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: 'config/tsconfig.json',
  },
  // Keep navigation responses and assets on the same release after publishing.
  deploymentId:
    process.env.NEXT_DEPLOYMENT_ID ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_BUILD_SHA ||
    process.env.GITHUB_SHA,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async redirects() {
    const { default: travels } = await import('./content/travel/exhibition.json', { with: { type: 'json' } })
    const { default: bangkok } = await import('./content/photography/photos/bangkok.json', { with: { type: 'json' } })
    return [
      ...['/travel', '/travel/hangzhou', '/travel/huzhou'].map(source => ({
        source, destination: '/photography#travels', permanent: true,
      })),
      ...travels.map(({ slug }) => ({
        source: `/travel/${slug}`, destination: `/photography#travels/${slug}/1`, permanent: true,
      })),
      { source: '/travel/bangkok', destination: `/photography#bangkok/${bangkok[0].id}`, permanent: true },
    ]
  },
  outputFileTracingIncludes: {
    '/*': ['./content/site/**/*', './content/photography/**/*', './content/travel/**/*', './content/hobby/**/*'],
  },
  outputFileTracingExcludes: {
    '/*': ['./content/writing/**/*', './workspace/writing/**/*'],
  },
  images: {
    // Every image is first-party. Filenames are stable, but the optimizer URL
    // carries the deployment ID, so a release still picks up replaced files.
    minimumCacheTTL: 2678400,
    // A 4:5 frame on an 800px-high desktop needs exactly 480px at 1×.
    deviceSizes: [480, 640, 750, 828, 1080, 1200, 1600, 1920, 2048, 3840],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
