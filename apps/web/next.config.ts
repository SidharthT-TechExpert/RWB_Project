import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Use 'standalone' for Docker/self-hosted AWS builds
  ...(process.env.NEXT_OUTPUT_MODE === 'standalone' && { output: 'standalone' }),
  eslint: {
    // Lint runs as a separate CI step — don't block the production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type checking runs as a separate CI step too
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
