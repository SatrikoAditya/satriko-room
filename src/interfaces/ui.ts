// src/interfaces/ui.ts
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}
export type Phase = 'loading' | 'gate' | 'entering' | 'ready'
export type Transition = 'idle' | 'focusing' | 'open' | 'closing'
export type Tier = 'high' | 'low'
export type WebglStatus = 'unknown' | 'supported' | 'unsupported' | 'lost'
export type SceneTheme = 'day' | 'night'
