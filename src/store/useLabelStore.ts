// src/store/useLabelStore.ts
'use client'

import { create } from 'zustand'

import { STORAGE_KEYS } from '@constants/storage'
import { readJSON, writeJSON } from '@utils/storage'

/**
 * Phones show every object's tag at once; this lets the visitor hide them to
 * see the whole room (decision 58). Desktop tags only appear on hover.
 */
interface LabelState {
  touchLabels: boolean
  toggleTouchLabels: () => void
  hydrate: () => void
}

export const useLabelStore = create<LabelState>((set, get) => ({
  touchLabels: true,
  toggleTouchLabels: () => {
    const touchLabels = !get().touchLabels
    writeJSON(STORAGE_KEYS.labels, { touchLabels })
    set({ touchLabels })
  },
  hydrate: () =>
    set({
      touchLabels:
        readJSON<{ touchLabels?: unknown } | null>(STORAGE_KEYS.labels, null)
          ?.touchLabels !== false,
    }),
}))
