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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

module.exports = nextConfig;
