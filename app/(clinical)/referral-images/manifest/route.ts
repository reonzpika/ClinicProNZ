import { NextResponse } from 'next/server';

/**
 * PWA manifest for Referral Images (scoped to this flow).
 * Served at /referral-images/manifest
 */
export async function GET() {
  const manifest = {
    name: 'ClinicPro Referral Images',
    short_name: 'Referrals',
    description: 'Phone to desktop clinical photos in 30 seconds. For NZ GPs.',
    start_url: '/referral-images/capture',
    display: 'standalone' as const,
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait' as const,
    categories: ['medical', 'productivity', 'utilities'],
    icons: [
      {
        src: '/icons/referral-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/referral-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
