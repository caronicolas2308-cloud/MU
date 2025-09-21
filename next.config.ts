// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      // ajoute des règles seulement si tu en as besoin
      // rules: { '*.css': { loaders: ['postcss'] } }
    },
  },
};

export default nextConfig;