import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://codeyx-web.vercel.app';
  
  const routes = [
    '',
    '/explore-sheets',
    '/explore-projects',
    '/patterns',
    '/contests',
    '/leaderboard',
    '/open-source',
    '/help',
    '/blog',
    '/community',
    '/documentation',
    '/privacy',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
