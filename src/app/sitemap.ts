import { MetadataRoute } from 'next';
import { api } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://slackdori.asyncsite.com';
  
  // Fetch all packs for dynamic routes
  const packs = await api.getPacks();
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/packs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
  
  // Dynamic pack pages
  const packPages: MetadataRoute.Sitemap = packs.map(pack => ({
    url: `${baseUrl}/packs/${pack.id}`,
    lastModified: new Date(pack.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  return [...staticPages, ...packPages];
}