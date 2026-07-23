import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
