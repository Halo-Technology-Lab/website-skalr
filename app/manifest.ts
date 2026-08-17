import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    icons: [
      {
        src: '/favicons/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicons/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    // TODO: set these from the wireframe palette.
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  };
}
