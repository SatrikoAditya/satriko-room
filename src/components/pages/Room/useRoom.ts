'use client'

import { useEffect, useRef } from 'react'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'
import { useActiveSection } from '@hooks/useActiveSection'

import {
  CLOSE_TIMEOUT_MS,
  ENTER_TIMEOUT_MS,
  FOCUS_TIMEOUT_MS,
} from '@constants/camera'
import type { SectionSlug } from '@interfaces/section'

export function useRoom(initialSection: SectionSlug | null) {
  const active = useActiveSection()
  const phase = useRoomStore((s) => s.phase)
  const transition = useRoomStore((s) => s.transition)
  const sceneReady = useSceneStore((s) => s.sceneReady)
  const prev = useRef<SectionSlug | null>(initialSection)

  // Direct links skip the loader gate.
  useEffect(() => {
    if (initialSection !== null) useRoomStore.getState().setPhase('ready')
  }, [initialSection])

  // The URL changed: open, close or switch.
  useEffect(() => {
    if (prev.current === active) return
    prev.current = active
    const { setTransition, setOriginRect } = useRoomStore.getState()
    if (active === null) {
      // Nothing is on screen while focusing, so there is nothing to animate out.
      setTransition(
        useRoomStore.getState().transition === 'focusing' ? 'idle' : 'closing',
      )
      return
    }
    setOriginRect(null)
    setTransition(useSceneStore.getState().sceneReady ? 'focusing' : 'open')
  }, [active, sceneReady])

  // Safety nets: never hang in 'focusing' or 'entering' if the camera can't report back.
  useEffect(() => {
    if (transition !== 'focusing') return
    const t = window.setTimeout(() => {
      if (useRoomStore.getState().transition === 'focusing')
        useRoomStore.getState().setTransition('open')
    }, FOCUS_TIMEOUT_MS)
    return () => window.clearTimeout(t)
  }, [transition])
  useEffect(() => {
    if (transition !== 'closing') return
    const t = window.setTimeout(() => {
      if (useRoomStore.getState().transition === 'closing')
        useRoomStore.getState().setTransition('idle')
    }, CLOSE_TIMEOUT_MS)
    return () => window.clearTimeout(t)
  }, [transition])
  useEffect(() => {
    if (phase !== 'entering') return
    const t = window.setTimeout(() => {
      if (useRoomStore.getState().phase === 'entering')
        useRoomStore.getState().setPhase('ready')
    }, ENTER_TIMEOUT_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  const showLoader =
    active === null && (phase === 'loading' || phase === 'gate')
  return { active, phase, transition, showLoader }
}
