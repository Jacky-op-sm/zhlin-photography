/** @type {import('next').NextConfig} */
const isDeployBuild = process.env.SKIP_TYPECHECK === '1';

const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/*': ['./content/**/*'],
    },
  },
  eslint: {
    ignoreDuringBuilds: isDeployBuild,
  },
  typescript: {
    ignoreBuildErrors: isDeployBuild,
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
