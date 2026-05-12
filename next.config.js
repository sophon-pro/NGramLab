/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ── GitHub Pages deployment ───────────────────────────────────────────
  // Comment these three lines out for local dev or Vercel deployment.
  // `basePath` must match your repository name exactly. If you deploy to
  // a root user domain (username.github.io), remove `basePath` entirely.
  output: 'export',
  basePath: '/ngramlab',
  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;
