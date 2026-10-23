// src/store/useSoundStore.ts
'use client'

import { create } from 'zustand'

import { STORAGE_KEYS } from '@constants/storage'
import { readJSON, writeJSON } from '@utils/storage'

interface SoundState {
  master: boolean
  music: boolean
  setMaster: (master: boolean) => void
  setMusic: (music: boolean) => void
  toggleMaster: () => void
  toggleMusic: () => void
  hydrate: () => void
}

const persist = (master: boolean) => writeJSON(STORAGE_KEYS.sound, { master })

// Sound is on by default (decision 60), so visitors notice it; a saved "off"
// is kept. Browsers still wait for the first tap, click or key press.
export const useSoundStore = create<SoundState>((set, get) => ({
  master: true,
  music: false,
  setMaster: (master) => {
    persist(master)
    set({ master })
  },
  setMusic: (music) => set({ music }),
  toggleMaster: () => get().setMaster(!get().master),
  toggleMusic: () => set({ music: !get().music }),
  hydrate: () =>
    set({
      master:
        readJSON<{ master?: unknown } | null>(STORAGE_KEYS.sound, null)
          ?.master !== false,
    }),
}))
