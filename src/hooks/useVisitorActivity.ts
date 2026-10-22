'use client'

import { useEffect } from 'react'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'

/** Clicks, taps and key presses count as activity; moving the mouse doesn't. */
const ACTIVITY_EVENTS = ['pointerdown', 'keydown'] as const

const markActivity = () =>
  useSceneStore.getState().setLastActivity(performance.now())

/** Keeps `lastActivity` in the scene store so Oyen knows when the room is quiet. */
export function useVisitorActivity() {
  const phase = useRoomStore((s) => s.phase)
  useEffect(() => {
    markActivity()
    for (const name of ACTIVITY_EVENTS)
      window.addEventListener(name, markActivity, {
        capture: true,
        passive: true,
      })
    return () => {
      for (const name of ACTIVITY_EVENTS)
        window.removeEventListener(name, markActivity, { capture: true })
    }
  }, [])
  // The quiet time is measured from when the room became ready, not from page load.
  useEffect(() => {
    if (phase === 'ready') markActivity()
  }, [phase])
}
