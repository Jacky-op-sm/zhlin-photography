/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep navigation responses and assets on the same release after publishing.
  deploymentId:
    process.env.NEXT_DEPLOYMENT_ID ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_BUILD_SHA ||
    process.env.GITHUB_SHA,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
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
