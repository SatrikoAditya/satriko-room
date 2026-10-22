// src/store/useSceneStore.ts
'use client'

import { create } from 'zustand'

import type { ObjectId } from '@interfaces/section'
import type { OyenState, SceneTheme, Tier, WebglStatus } from '@interfaces/ui'

interface SceneState {
  hovered: ObjectId | null
  setHovered: (id: ObjectId | null) => void
  hint: ObjectId | null
  setHint: (id: ObjectId | null) => void
  tier: Tier
  setTier: (tier: Tier) => void
  webgl: WebglStatus
  setWebgl: (webgl: WebglStatus) => void
  theme: SceneTheme
  setTheme: (theme: SceneTheme) => void
  sceneReady: boolean
  setSceneReady: (sceneReady: boolean) => void
  progress: number
  setProgress: (progress: number) => void
  bubble: string | null
  setBubble: (bubble: string | null) => void
  oyenAnchor: { x: number; y: number } | null
  setOyenAnchor: (oyenAnchor: { x: number; y: number } | null) => void
  /** `performance.now()` of the visitor's last click, tap or key press. */
  lastActivity: number
  setLastActivity: (lastActivity: number) => void
  oyenState: OyenState
  setOyenState: (oyenState: OyenState) => void
  /** True while the free view is zoomed in past VIEW_ZOOMED_AT. */
  zoomedIn: boolean
  setZoomedIn: (zoomedIn: boolean) => void
  /** Bumped to ask the camera to glide back to the full room. */
  resetViewTick: number
  requestResetView: () => void
}

export const useSceneStore = create<SceneState>((set) => ({
  hovered: null,
  setHovered: (hovered) => set({ hovered }),
  hint: null,
  setHint: (hint) => set({ hint }),
  tier: 'high',
  setTier: (tier) => set({ tier }),
  webgl: 'unknown',
  setWebgl: (webgl) => set({ webgl }),
  theme: 'day',
  setTheme: (theme) => set({ theme }),
  sceneReady: false,
  setSceneReady: (sceneReady) => set({ sceneReady }),
  progress: 0,
  setProgress: (progress) => set({ progress }),
  bubble: null,
  setBubble: (bubble) => set({ bubble }),
  oyenAnchor: null,
  setOyenAnchor: (oyenAnchor) => set({ oyenAnchor }),
  lastActivity: 0,
  setLastActivity: (lastActivity) => set({ lastActivity }),
  oyenState: 'sitting',
  setOyenState: (oyenState) => set({ oyenState }),
  zoomedIn: false,
  setZoomedIn: (zoomedIn) => set({ zoomedIn }),
  resetViewTick: 0,
  requestResetView: () => set((s) => ({ resetViewTick: s.resetViewTick + 1 })),
}))
