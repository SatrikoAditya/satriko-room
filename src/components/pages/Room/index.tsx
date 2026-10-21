'use client'

import Poster from '@components/molecules/Poster'
import ModalHost from '@components/organisms/ModalHost'
import SectionNav from '@components/organisms/SectionNav'

import type { SectionSlug } from '@interfaces/section'

export default function Room({
  initialSection,
}: {
  initialSection: SectionSlug | null
}) {
  return (
    <main
      className="relative h-dvh w-full overflow-hidden"
      data-initial-section={initialSection ?? ''}
    >
      <SectionNav />
      <Poster />
      <ModalHost />
    </main>
  )
}
