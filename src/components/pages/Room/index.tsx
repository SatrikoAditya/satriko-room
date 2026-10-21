'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'motion/react'

import Poster from '@components/molecules/Poster'
import ProgressPill from '@components/molecules/ProgressPill'
import SpeechBubble from '@components/molecules/SpeechBubble'
import Hud from '@components/organisms/Hud'
import Loader from '@components/organisms/Loader'
import ModalHost from '@components/organisms/ModalHost'
import SectionNav from '@components/organisms/SectionNav'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'
import { useIdleHint } from '@hooks/useIdleHint'
import { useWebGLSupport } from '@hooks/useWebGLSupport'

import { oyenLines } from '@content/oyen'
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
  const { phase, transition, active, showLoader } = useRoom(initialSection)
  useWebGLSupport()
  useIdleHint()
  const prevPhase = useRef(phase)
  useEffect(() => {
    if (prevPhase.current === 'entering' && phase === 'ready')
      useSceneStore.getState().setBubble(oyenLines.greeting)
    prevPhase.current = phase
  }, [phase])
  const webgl = useSceneStore((s) => s.webgl)
  const sceneReady = useSceneStore((s) => s.sceneReady)
  const enter = () =>
    useRoomStore
      .getState()
      .setPhase(webgl === 'supported' && sceneReady ? 'entering' : 'ready')
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
      <SpeechBubble />
      {active !== null && <ProgressPill />}
      <AnimatePresence>
        {showLoader && <Loader key="loader" onEnter={enter} />}
      </AnimatePresence>
    </main>
  )
}
