'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
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
import { useSoundEffects } from '@hooks/useSoundEffects'
import { useThemeSync } from '@hooks/useThemeSync'
import { useWebGLSupport } from '@hooks/useWebGLSupport'

import { oyenLines } from '@content/oyen'
import type { SectionSlug } from '@interfaces/section'
import { audio } from '@utils/audio'

import { useRoom } from './useRoom'

const SceneCanvas = dynamic(() => import('@components/three/SceneCanvas'), {
  ssr: false,
})

const subscribeNever = () => () => {}

export default function Room({
  initialSection,
}: {
  initialSection: SectionSlug | null
}) {
  const { phase, transition, active, showLoader } = useRoom(initialSection)
  // ?poster=1 renders the bare scene (used by the poster capture script).
  const poster = useSyncExternalStore(
    subscribeNever,
    () => new URLSearchParams(window.location.search).has('poster'),
    () => false,
  )
  useEffect(() => {
    if (poster) useRoomStore.getState().setPhase('ready')
  }, [poster, phase])
  useWebGLSupport()
  useIdleHint()
  useThemeSync()
  useSoundEffects()
  useEffect(() => {
    const once = () => audio.unlock()
    window.addEventListener('pointerdown', once, { once: true })
    return () => window.removeEventListener('pointerdown', once)
  }, [])
  const prevPhase = useRef(phase)
  useEffect(() => {
    if (prevPhase.current === 'entering' && phase === 'ready')
      useSceneStore.getState().setBubble(oyenLines.greeting)
    prevPhase.current = phase
  }, [phase])
  const webgl = useSceneStore((s) => s.webgl)
  const tier = useSceneStore((s) => s.tier)
  const sceneReady = useSceneStore((s) => s.sceneReady)
  const enter = () => {
    audio.unlock()
    useRoomStore
      .getState()
      .setPhase(webgl === 'supported' && sceneReady ? 'entering' : 'ready')
  }
  return (
    <main
      className="relative h-dvh w-full overflow-hidden"
      data-phase={phase}
      data-transition={transition}
      data-webgl={webgl}
      data-tier={tier}
    >
      <SectionNav />
      <Poster hidden={sceneReady} />
      {webgl === 'supported' && <SceneCanvas />}
      <ModalHost />
      {!poster && <Hud />}
      {!poster && <SpeechBubble />}
      {!poster && active !== null && <ProgressPill />}
      <AnimatePresence>
        {!poster && showLoader && <Loader key="loader" onEnter={enter} />}
      </AnimatePresence>
    </main>
  )
}
