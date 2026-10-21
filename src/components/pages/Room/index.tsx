'use client'

import dynamic from 'next/dynamic'

import Poster from '@components/molecules/Poster'
import Hud from '@components/organisms/Hud'
import ModalHost from '@components/organisms/ModalHost'
import SectionNav from '@components/organisms/SectionNav'

import { useSceneStore } from '@store/useSceneStore'
import { useWebGLSupport } from '@hooks/useWebGLSupport'

import type { SectionSlug } from '@interfaces/section'

import { useRoom } from './useRoom'

const SceneCanvas = dynamic(() => import('@components/three/SceneCanvas'), {
  ssr: false,
})

export default function Room({
  initialSection,
}: {
  initialSection: SectionSlug | null
}) {
  const { phase, transition } = useRoom(initialSection)
  useWebGLSupport()
  const webgl = useSceneStore((s) => s.webgl)
  const sceneReady = useSceneStore((s) => s.sceneReady)
  return (
    <main
      className="relative h-dvh w-full overflow-hidden"
      data-phase={phase}
      data-transition={transition}
      data-webgl={webgl}
    >
      <SectionNav />
      <Poster hidden={sceneReady} />
      {webgl === 'supported' && <SceneCanvas />}
      <ModalHost />
      <Hud />
    </main>
  )
}
