import { describe, expect, it } from 'vitest'

import { VIEW_EYE_ELEVATION, VIEW_MAX_ZOOM } from '@constants/camera'

import {
  clampPan,
  clampZoom,
  polarForZoom,
  viewLookAt,
  wheelZoom,
  zoomTowardCursor,
} from './freeView'

const POLAR_DEFAULT = 1.045
const EYE_POLAR = Math.PI / 2 - VIEW_EYE_ELEVATION
const home = { target: [0, 1.4, 0], offset: [10, 8.2, 10] } as const

describe('polarForZoom', () => {
  it('keeps the default angle at 1× and reaches eye level at full zoom', () => {
    expect(polarForZoom(1, POLAR_DEFAULT)).toBeCloseTo(POLAR_DEFAULT)
    expect(polarForZoom(VIEW_MAX_ZOOM, POLAR_DEFAULT)).toBeCloseTo(EYE_POLAR)
  })

  it('lowers the camera steadily as the zoom grows', () => {
    let previous = polarForZoom(1, POLAR_DEFAULT)
    for (let z = 1.05; z <= VIEW_MAX_ZOOM; z += 0.05) {
      const polar = polarForZoom(z, POLAR_DEFAULT)
      expect(polar).toBeGreaterThanOrEqual(previous)
      previous = polar
    }
  })
})

describe('zoom limits', () => {
  it('clamps the zoom between 1× and the maximum', () => {
    expect(clampZoom(0.5)).toBe(1)
    expect(clampZoom(5)).toBe(VIEW_MAX_ZOOM)
  })

  it('zooms in on scroll up and out on scroll down, a pinch faster than a wheel', () => {
    expect(wheelZoom(1, -100, false)).toBeGreaterThan(1)
    expect(wheelZoom(1.5, 100, false)).toBeLessThan(1.5)
    expect(wheelZoom(1, -100, true)).toBeGreaterThan(wheelZoom(1, -100, false))
    expect(wheelZoom(1, 10_000, false)).toBe(1)
    expect(wheelZoom(1, -10_000, false)).toBe(VIEW_MAX_ZOOM)
  })
})

describe('clampPan', () => {
  const half = { x: 10, y: 6 }

  it('allows no pan at 1×, so zooming out recentres the room', () => {
    expect(clampPan({ x: 5, y: -3 }, 1, half)).toEqual({ x: 0, y: 0 })
  })

  it('allows up to half the default view at 2×', () => {
    expect(clampPan({ x: 99, y: -99 }, 2, half)).toEqual({ x: 5, y: -3 })
    expect(clampPan({ x: 1, y: 1 }, 2, half)).toEqual({ x: 1, y: 1 })
  })
})

describe('zoomTowardCursor', () => {
  it('keeps the point under the cursor still', () => {
    const baseZoom = 50
    const cursor = { x: 200, y: -80 }
    const before = { x: 1, y: 2 }
    const after = zoomTowardCursor(before, cursor, 1.2, 1.8, baseZoom)
    // world offset of the cursor point = pan + cursor / zoom
    const worldBefore = before.x + cursor.x / (baseZoom * 1.2)
    const worldAfter = after.x + cursor.x / (baseZoom * 1.8)
    expect(worldAfter).toBeCloseTo(worldBefore)
    expect(after.y + cursor.y / (baseZoom * 1.8)).toBeCloseTo(
      before.y + cursor.y / (baseZoom * 1.2),
    )
  })

  it('does not move the view when zooming at the centre', () => {
    expect(zoomTowardCursor({ x: 1, y: 2 }, { x: 0, y: 0 }, 1, 2, 50)).toEqual({
      x: 1,
      y: 2,
    })
  })
})

describe('viewLookAt', () => {
  it('returns the default camera at 1× with no pan or tilt', () => {
    const [px, py, pz, tx, ty, tz] = viewLookAt(home, 1, { x: 0, y: 0 })
    expect([tx, ty, tz]).toEqual([0, 1.4, 0])
    expect(px).toBeCloseTo(10)
    expect(py - ty).toBeCloseTo(8.2)
    expect(pz).toBeCloseTo(10)
  })

  it('lowers the camera at full zoom but keeps looking into the corner', () => {
    const [px, py, pz, tx, ty, tz] = viewLookAt(home, VIEW_MAX_ZOOM, {
      x: 0,
      y: 0,
    })
    const distance = Math.hypot(px - tx, py - ty, pz - tz)
    expect(Math.asin((py - ty) / distance)).toBeCloseTo(VIEW_EYE_ELEVATION)
    expect(px - tx).toBeCloseTo(pz - tz) // still on the 45° diagonal
  })

  it('slides the target along the screen: right is +x/−z, up is world-up at eye level', () => {
    const right = viewLookAt(home, 1.5, { x: 1, y: 0 })
    expect(right[3]).toBeGreaterThan(0)
    expect(right[5]).toBeLessThan(0)
    expect(right[3]).toBeCloseTo(-right[5])
    const up = viewLookAt(home, VIEW_MAX_ZOOM, { x: 0, y: 1 })
    expect(up[4] - 1.4).toBeCloseTo(Math.cos(VIEW_EYE_ELEVATION))
  })
})
