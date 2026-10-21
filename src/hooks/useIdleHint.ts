'use client'

import { useEffect } from 'react'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'

import { HINT_DELAY_MS, hintOrder, MAX_HINTS } from '@constants/hints'
import { STORAGE_KEYS } from '@constants/storage'
import { oyenLines } from '@content/oyen'
import { currentSlug } from '@utils/history'
import { readJSON, writeJSON } from '@utils/storage'

import { useActiveSection } from './useActiveSection'

export function useIdleHint() {
  const phase = useRoomStore((s) => s.phase)
  const active = useActiveSection()
  useEffect(() => {
    if (
      phase !== 'ready' ||
      active !== null ||
      readJSON(STORAGE_KEYS.interacted, false)
    )
      return
    let count = 0
    let timer = 0
    const stop = () => {
      window.clearTimeout(timer)
      useSceneStore.getState().setHint(null)
      window.removeEventListener('pointerdown', onInteract)
      window.removeEventListener('keydown', onInteract)
    }
    const onInteract = () => {
      writeJSON(STORAGE_KEYS.interacted, true)
      stop()
    }
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (currentSlug() !== null || count >= MAX_HINTS) return stop()
        const s = useSceneStore.getState()
        s.setHint(hintOrder[count])
        s.setBubble(oyenLines.hints[count])
        count += 1
        schedule()
      }, HINT_DELAY_MS)
    }
    window.addEventListener('pointerdown', onInteract)
    window.addEventListener('keydown', onInteract)
    schedule()
    return stop
  }, [phase, active])
}
