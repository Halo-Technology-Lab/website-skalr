import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

/**
 * Static sitemap. Add an entry for every new public route.
 *
 * If dynamic routes are introduced later, fetch their slugs here and append
 * them to the array - keep this file the single place that knows the URL set.
 */
const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteConfig.url}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
