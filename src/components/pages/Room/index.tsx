'use client'

import Poster from '@components/molecules/Poster'
import ModalHost from '@components/organisms/ModalHost'
import SectionNav from '@components/organisms/SectionNav'

import type { SectionSlug } from '@interfaces/section'

import { useRoom } from './useRoom'

export default function Room({
  initialSection,
}: {
  initialSection: SectionSlug | null
}) {
  const { phase, transition } = useRoom(initialSection)
  return (
    <main
      className="relative h-dvh w-full overflow-hidden"
      data-phase={phase}
      data-transition={transition}
    >
      <SectionNav />
      <Poster />
      <ModalHost />
    </main>
  )
}
