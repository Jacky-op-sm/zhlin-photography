/** @type {import('next').NextConfig} */
const nextConfig = {
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
