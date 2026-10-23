'use client'

import { useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

import { indonesiaMap } from '@constants/indonesiaMap'
import { palette } from '@constants/roomPalette'
import { PIN_RADIUS } from '@constants/travel'
import { travelPins } from '@content/travel'
import type { ITravelPin } from '@models/travel'
import { mercatorXY } from '@utils/map'
import { layoutPins } from '@utils/travel'

export function useMapTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = indonesiaMap.width
    canvas.height = indonesiaMap.height
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = palette.sky
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = palette.mint
    ctx.strokeStyle = palette.woodDark
    ctx.lineWidth = 3
    const path = new Path2D(indonesiaMap.path)
    ctx.fill(path)
    ctx.stroke(path)
    // Same spots as the Travel panel, with same-spot pins pushed apart.
    const project = (p: ITravelPin) =>
      mercatorXY(p.lat, p.lon, indonesiaMap.scale, indonesiaMap.translate)
    ctx.fillStyle = palette.terracotta
    for (const { x, y } of layoutPins(travelPins, project)) {
      ctx.beginPath()
      ctx.arc(x, y, PIN_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    }
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    return texture
  }, [])
}
