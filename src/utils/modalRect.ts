import type { Rect } from '@interfaces/ui'

export const MOBILE_BREAKPOINT = 640

export function finalRect(viewportWidth: number, viewportHeight: number): Rect {
  if (viewportWidth < MOBILE_BREAKPOINT) {
    const width = Math.round(viewportWidth * 0.95)
    const height = Math.round(viewportHeight * 0.92)
    return {
      x: Math.round((viewportWidth - width) / 2),
      y: viewportHeight - height,
      width,
      height,
    }
  }
  const width = Math.min(Math.round(viewportWidth * 0.8), 1100)
  const height = Math.round(viewportHeight * 0.8)
  return {
    x: Math.round((viewportWidth - width) / 2),
    y: Math.round((viewportHeight - height) / 2),
    width,
    height,
  }
}

export function growTransform(from: Rect, to: Rect) {
  return {
    x: from.x - to.x,
    y: from.y - to.y,
    scaleX: from.width / to.width,
    scaleY: from.height / to.height,
  }
}
