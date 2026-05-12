/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/NGramLab',
  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;