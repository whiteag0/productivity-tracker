/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [],
      unoptimized: true,
    },
    eslint: {
      ignoreDuringBuilds: true, // This will ignore ESLint errors during build
    },
  }
  
  module.exports = nextConfig