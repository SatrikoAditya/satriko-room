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
import SceneErrorBoundary from '@components/three/SceneCanvas/SceneErrorBoundary'

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

const markSceneLost = () => useSceneStore.getState().setWebgl('lost')
const SceneUnavailable = () => null

// A failed download of the 3D chunk falls back to the poster instead of the error page.
const SceneCanvas = dynamic(
  () =>
    import('@components/three/SceneCanvas').catch((error: unknown) => {
      console.error(
        'The 3D scene could not be loaded; showing the simple view.',
        error,
      )
      markSceneLost()
      return { default: SceneUnavailable }
    }),
  { ssr: false },
)

const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'click'] as const

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
  // Any user activation (pointer, key, click) unlocks audio; keep trying until it runs.
  useEffect(() => {
    const detach = () =>
      UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, onActivate))
    function onActivate() {
      audio.unlock()
      if (audio.isRunning()) detach()
    }
    UNLOCK_EVENTS.forEach((e) => window.addEventListener(e, onActivate))
    return detach
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
  const gated = !poster && showLoader
  return (
    <main
      className="relative h-dvh w-full overflow-hidden"
      data-phase={phase}
      data-transition={transition}
      data-webgl={webgl}
      data-tier={tier}
    >
      <h1 className="sr-only">{"Satriko's Room"}</h1>
      <p className="sr-only">
        An illustrated 3D room. Use the phone menu to explore sections.
      </p>
      {/* While the loader gate is up, only the loader can be reached. */}
      <div inert={gated}>
        <SectionNav />
        <Poster hidden={sceneReady} />
        {webgl === 'supported' && (
          <SceneErrorBoundary onError={markSceneLost}>
            <SceneCanvas />
          </SceneErrorBoundary>
        )}
        <ModalHost />
        {!poster && <Hud />}
        {!poster && <SpeechBubble />}
        {!poster && active !== null && <ProgressPill />}
      </div>
      <AnimatePresence>
        {gated && <Loader key="loader" onEnter={enter} />}
      </AnimatePresence>
    </main>
  )
}
