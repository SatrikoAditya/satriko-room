'use client'

import { useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

import { skyColors, type SkyPhase } from '@utils/sky'

export function useSkyTexture(phase: SkyPhase) {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 128)
    g.addColorStop(0, skyColors[phase].top)
    g.addColorStop(1, skyColors[phase].bottom)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 4, 128)
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return t
  }, [phase])
}
