/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@school-os/ui', '@school-os/db'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

module.exports = nextConfig;
