import type { SceneTheme } from '@interfaces/ui'

export interface LightingPreset {
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
  sunIntensity: number
  sunColor: string
  ambient: number
  lamp: number
  screenGlow: number
  moon: number
}

// Day = the approved Task 19 lighting. Night keeps the design ratios against it
// (sun x0.16), with hemi and ambient lifted after the night screenshot check.
export const lightingPresets: Record<SceneTheme, LightingPreset> = {
  day: {
    hemiSky: '#fffcf7',
    hemiGround: '#efe3d2',
    hemiIntensity: 2.4,
    sunIntensity: 1.3,
    sunColor: '#fffaf2',
    ambient: 0.3,
    lamp: 0,
    screenGlow: 0.5,
    moon: 0,
  },
  night: {
    hemiSky: '#3a4a70',
    hemiGround: '#2a2238',
    hemiIntensity: 1.5,
    sunIntensity: 0.21,
    sunColor: '#9fb4ff',
    ambient: 0.16,
    lamp: 2.2,
    screenGlow: 1.1,
    moon: 0.5,
  },
}

export const THEME_BLEND_SECONDS = 0.8
