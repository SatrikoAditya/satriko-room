import type { MetadataRoute } from 'next'

import { sectionSlugs } from '@constants/sections'
import { site } from '@constants/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, priority: 1 },
    ...sectionSlugs.map((s) => ({ url: `${site.url}/${s}`, priority: 0.8 })),
  ]
}
