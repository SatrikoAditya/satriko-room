import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import JsonLd from '@components/organisms/JsonLd'
import Room from '@components/pages/Room'

import { isSectionSlug, sectionBySlug, sectionSlugs } from '@constants/sections'
import { site } from '@constants/site'

type Params = { section?: string[] }
export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return [{ section: [] }, ...sectionSlugs.map((s) => ({ section: [s] }))]
}

function resolve(section?: string[]) {
  if (!section || section.length === 0) return null
  if (section.length === 1 && isSectionSlug(section[0])) return section[0]
  return undefined // unknown
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const slug = resolve((await params).section)
  if (slug === undefined) return {}
  const base = {
    openGraph: { images: ['/poster/og.png'] },
    twitter: { card: 'summary_large_image' as const },
  }
  if (slug === null) return { ...base, alternates: { canonical: '/' } }
  const s = sectionBySlug(slug)
  return {
    ...base,
    title: s.seo.title,
    description: s.seo.description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      ...base.openGraph,
      title: s.seo.title,
      description: s.seo.description,
      url: `${site.url}/${slug}`,
    },
  }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const slug = resolve((await params).section)
  if (slug === undefined) notFound()
  return (
    <>
      {slug === null && <JsonLd />}
      <Room initialSection={slug} />
    </>
  )
}
