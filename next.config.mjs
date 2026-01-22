import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Temporarily disable strict mode in development to prevent double Ably connections
  reactStrictMode: process.env.NODE_ENV === 'production',
  serverExternalPackages: ['@electric-sql/pglite', 'ably'],
};

export default bundleAnalyzer(nextConfig);
