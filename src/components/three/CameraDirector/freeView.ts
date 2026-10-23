// Pure maths for the free view: zooming into the room lowers the camera toward
// eye level while it keeps looking along the room's diagonal into the corner.
import {
  VIEW_EYE_ELEVATION,
  VIEW_MAX_ZOOM,
  VIEW_PINCH_WHEEL_SPEED,
  VIEW_WHEEL_SPEED,
} from '@constants/camera'

/** Offset of the look target in world units, along the screen's right and up. */
export interface Pan {
  x: number
  y: number
}

/** The fitted default view: the camera sits at target + offset. */
export interface Home {
  target: readonly [number, number, number]
  offset: readonly [number, number, number]
}

/** Small angle offsets added on top (the mouse-follow tilt). */
export interface Tilt {
  azimuth: number
  polar: number
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

export function clampZoom(z: number): number {
  return clamp(z, 1, VIEW_MAX_ZOOM)
}

/** 0 at the default view, 1 at full zoom, eased in and out. */
export function zoomProgress(z: number): number {
  const t = clamp((z - 1) / (VIEW_MAX_ZOOM - 1), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Polar angle (from straight up): the default at 1×, eye level at full zoom. */
export function polarForZoom(z: number, polarDefault: number): number {
  const eye = Math.PI / 2 - VIEW_EYE_ELEVATION
  return polarDefault + (eye - polarDefault) * zoomProgress(z)
}

/** A wheel step: scrolling up zooms in. A trackpad pinch arrives with ctrlKey. */
export function wheelZoom(z: number, deltaY: number, pinch: boolean): number {
  const speed = pinch ? VIEW_PINCH_WHEEL_SPEED : VIEW_WHEEL_SPEED
  return clampZoom(z * Math.exp(-deltaY * speed))
}

/**
 * How far the view may pan at zoom z. `half` is half the world area visible at
 * 1×; `reach` is half the area the view may show at most (by default the same,
 * so the view never leaves what the default framing shows and recentres at 1×;
 * phones pass the whole room, which their closer 1× view crops).
 */
export function panRange(z: number, half: Pan, reach: Pan = half): Pan {
  return {
    x: Math.max(0, reach.x - half.x / z),
    y: Math.max(0, reach.y - half.y / z),
  }
}

export function clampPan(p: Pan, z: number, half: Pan, reach: Pan = half): Pan {
  const r = panRange(z, half, reach)
  // A plain 0 (not -0) when there's no room to pan.
  return {
    x: r.x === 0 ? 0 : clamp(p.x, -r.x, r.x),
    y: r.y === 0 ? 0 : clamp(p.y, -r.y, r.y),
  }
}

/**
 * Pan that keeps the world point under the cursor still while zooming from z0
 * to z1. `cursor` is in pixels from the canvas centre (y up); on an
 * orthographic camera one pixel is 1 / zoom world units.
 */
export function zoomTowardCursor(
  p: Pan,
  cursor: Pan,
  z0: number,
  z1: number,
  baseZoom: number,
): Pan {
  const k = 1 / (baseZoom * z0) - 1 / (baseZoom * z1)
  return { x: p.x + cursor.x * k, y: p.y + cursor.y * k }
}

/** camera-controls setLookAt arguments (position, then target) for a view. */
export function viewLookAt(
  home: Home,
  z: number,
  p: Pan,
  tilt: Tilt = { azimuth: 0, polar: 0 },
): [number, number, number, number, number, number] {
  const [ox, oy, oz] = home.offset
  const distance = Math.hypot(ox, oy, oz)
  const azimuth = Math.atan2(ox, oz) + tilt.azimuth
  const polar = polarForZoom(z, Math.acos(oy / distance)) + tilt.polar
  const dir = [
    Math.sin(polar) * Math.sin(azimuth),
    Math.cos(polar),
    Math.sin(polar) * Math.cos(azimuth),
  ]
  // The camera looks along -dir: screen right = forward × world up, screen up = right × forward.
  const right = [Math.cos(azimuth), 0, -Math.sin(azimuth)]
  const up = [
    -Math.cos(polar) * Math.sin(azimuth),
    Math.sin(polar),
    -Math.cos(polar) * Math.cos(azimuth),
  ]
  const target = home.target.map((t, i) => t + right[i] * p.x + up[i] * p.y)
  return [
    target[0] + dir[0] * distance,
    target[1] + dir[1] * distance,
    target[2] + dir[2] * distance,
    target[0],
    target[1],
    target[2],
  ]
}
