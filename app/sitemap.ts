import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';

const pages: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'];
  priority: MetadataRoute.Sitemap[0]['priority'];
}> = [
  { path: '/', changeFrequency: 'monthly', priority: 1 },
  { path: '/12-month-prescriptions', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/12-month-prescriptions/guide', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/ai-scribe', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/referral-images', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/acc', changeFrequency: 'monthly', priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
