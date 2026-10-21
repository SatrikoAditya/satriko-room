'use client'

import { useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

import { indonesiaMap } from '@constants/indonesiaMap'
import { palette } from '@constants/roomPalette'
import { travelPins } from '@content/travel'
import { mercatorXY } from '@utils/map'

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
    ctx.fillStyle = palette.terracotta
    for (const pin of travelPins) {
      const { x, y } = mercatorXY(
        pin.lat,
        pin.lon,
        indonesiaMap.scale,
        indonesiaMap.translate,
      )
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fill()
    }
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    return texture
  }, [])
}
