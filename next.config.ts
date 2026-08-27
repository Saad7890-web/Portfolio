import type { NextConfig } from 'next';

/**
 * Static export so the same artifact deploys to Vercel or GitHub Pages.
 * For project-page hosting (github.io/Portfolio) set NEXT_PUBLIC_BASE_PATH=/Portfolio.
 * For a custom domain (or Vercel) leave it unset.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
