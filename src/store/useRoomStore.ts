// src/store/useRoomStore.ts
'use client'

import { create } from 'zustand'

import type { Phase, Rect, Transition } from '@interfaces/ui'

interface RoomState {
  phase: Phase
  setPhase: (phase: Phase) => void
  transition: Transition
  setTransition: (transition: Transition) => void
  originRect: Rect | null
  setOriginRect: (originRect: Rect | null) => void
  openedInApp: boolean
  setOpenedInApp: (openedInApp: boolean) => void
}

export const useRoomStore = create<RoomState>((set) => ({
  phase: 'loading',
  setPhase: (phase) => set({ phase }),
  transition: 'idle',
  setTransition: (transition) => set({ transition }),
  originRect: null,
  setOriginRect: (originRect) => set({ originRect }),
  openedInApp: false,
  setOpenedInApp: (openedInApp) => set({ openedInApp }),
}))
