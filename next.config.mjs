import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // During builds, we'll ignore ESLint errors temporarily to avoid deployment issues
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  // Temporarily disable strict mode in development to prevent double Ably connections
  reactStrictMode: process.env.NODE_ENV === 'production',
  serverExternalPackages: ['@electric-sql/pglite'],
};

export default bundleAnalyzer(nextConfig);
