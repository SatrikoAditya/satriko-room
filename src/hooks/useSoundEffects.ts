'use client'

import { useEffect } from 'react'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'
import { useSoundStore } from '@store/useSoundStore'

import { audio } from '@utils/audio'
import { currentSlug } from '@utils/history'

export function useSoundEffects() {
  useEffect(() => {
    const unsubs = [
      useSoundStore.subscribe((s, prev) => {
        if (s.master !== prev.master) audio.setMuted(!s.master)
        if (s.music !== prev.music) {
          if (s.music) {
            audio.playSfx('radio')
            audio.startMusic()
          } else audio.stopMusic()
        }
      }),
      useSceneStore.subscribe((s, prev) => {
        if (s.hovered && s.hovered !== prev.hovered) audio.playSfx('tick')
        if (s.theme !== prev.theme) audio.playSfx('switch')
        if (s.bubble && s.bubble !== prev.bubble && s.hint === null)
          audio.playSfx('meow')
      }),
      useRoomStore.subscribe((s, prev) => {
        const t = s.transition
        const changed = t !== prev.transition
        if (changed && t === 'focusing') audio.playSfx('pop')
        if (changed && (t === 'open' || t === 'closing'))
          audio.playSfx('whoosh')
        if (changed && t === 'open' && currentSlug() === 'resume')
          audio.playSfx('printer')
      }),
    ]
    audio.setMuted(!useSoundStore.getState().master)
    return () => unsubs.forEach((u) => u())
  }, [])

  useEffect(() => {
    const onVisibility = () =>
      audio.setMuted(document.hidden || !useSoundStore.getState().master)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
}
