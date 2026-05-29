import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/settings/', '/api/', '/workspace/', '/complete-profile/'],
    },
    sitemap: 'https://codeyx-web.vercel.app/sitemap.xml',
  };
}
