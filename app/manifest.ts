import type { MetadataRoute } from 'next';
import { BRAND_COLOR, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'Payments',
    description: SITE_DESCRIPTION,
    start_url: '/payments',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: BRAND_COLOR,
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
