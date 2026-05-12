/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/NLPLearningLab',
  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;
