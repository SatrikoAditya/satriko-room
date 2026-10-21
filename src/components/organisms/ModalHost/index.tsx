'use client'

import Link from 'next/link'

import { useActiveSection } from '@hooks/useActiveSection'

import { sectionBySlug } from '@constants/sections'

import { panelComponents } from './panels'

export default function ModalHost() {
  const slug = useActiveSection()
  if (!slug) return null
  const section = sectionBySlug(slug)
  const Panel = panelComponents[slug]
  return (
    <section
      aria-labelledby="panel-title"
      className="stitched rounded-frame bg-paper fixed inset-4 z-40 overflow-auto p-6 shadow-2xl"
    >
      <h2 id="panel-title" className="font-display text-3xl font-extrabold">
        {section.title}
      </h2>
      <Link href="/" className="font-display absolute top-4 right-4 font-bold">
        Close ✕
      </Link>
      <div className="mt-4">
        <Panel />
      </div>
    </section>
  )
}
