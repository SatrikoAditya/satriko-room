'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

import { useSceneStore } from '@store/useSceneStore'

import {
  CAMERA_SMOOTH_TIME,
  PARALLAX_AZIMUTH,
  PARALLAX_POLAR,
  VIEW_SMOOTH_SECONDS,
  VIEW_ZOOMED_AT,
} from '@constants/camera'

import {
  clampPan,
  clampZoom,
  viewLookAt,
  wheelZoom,
  zoomTowardCursor,
  type Home,
  type Pan,
  type Tilt,
} from './freeView'

/** The current framing, read fresh on every use (it changes on resize). */
export interface ViewFrame {
  home: Home
  /** Camera zoom at 1× (the fitted zoom, including the phone framing). */
  baseZoom: number
  /** Half the world area visible at 1×. */
  half: Pan
}

export interface CameraMove {
  args: ReturnType<typeof viewLookAt>
  zoom: number
}

interface ViewState {
  z: number
  p: Pan
  zTarget: number
  pTarget: Pan
}

const ORIGIN: Pan = { x: 0, y: 0 }

/**
 * Wheel, drag and pinch input for the free view (the room with no panel open).
 * The hook keeps the zoom and pan; the camera director applies `step()`'s result.
 */
export function useFreeView({
  isActive,
  frame,
  reducedMotion,
}: {
  isActive: () => boolean
  frame: () => ViewFrame
  reducedMotion: boolean
}) {
  const view = useRef<ViewState>({
    z: 1,
    p: ORIGIN,
    zTarget: 1,
    pTarget: ORIGIN,
  })
  const tilt = useRef<Tilt>({ azimuth: 0, polar: 0 })
  const applied = useRef('')
  const gl = useThree((s) => s.gl)

  /** Glide back to the full room (smoothly, through step()). */
  const reset = useCallback(() => {
    view.current.zTarget = 1
    view.current.pTarget = ORIGIN
  }, [])

  /** Jump the current view to its targets (after an animated glide put it there). */
  const settle = useCallback(() => {
    const v = view.current
    v.z = v.zTarget
    v.p = v.pTarget
    applied.current = ''
  }, [])

  /** Where the saved view sits, for an animated glide back to it. */
  const target = useCallback((): CameraMove => {
    const { home, baseZoom, half } = frame()
    const v = view.current
    v.pTarget = clampPan(v.pTarget, v.zTarget, half)
    return {
      args: viewLookAt(home, v.zTarget, v.pTarget),
      zoom: baseZoom * v.zTarget,
    }
  }, [frame])

  /** One frame of easing. Returns the camera to apply, or null when nothing changed. */
  const step = useCallback(
    (dt: number, pointer: Pan): CameraMove | null => {
      const { home, baseZoom, half } = frame()
      const v = view.current
      const k = reducedMotion ? 1 : 1 - Math.exp(-dt / VIEW_SMOOTH_SECONDS)
      v.pTarget = clampPan(v.pTarget, v.zTarget, half)
      v.z += (v.zTarget - v.z) * k
      if (Math.abs(v.zTarget - v.z) < 1e-4) v.z = v.zTarget
      v.p = clampPan(
        {
          x: v.p.x + (v.pTarget.x - v.p.x) * k,
          y: v.p.y + (v.pTarget.y - v.p.y) * k,
        },
        v.z,
        half,
      )
      const tk = reducedMotion ? 1 : 1 - Math.exp(-dt / CAMERA_SMOOTH_TIME)
      const t = tilt.current
      t.azimuth += (pointer.x * PARALLAX_AZIMUTH - t.azimuth) * tk
      t.polar += (-pointer.y * PARALLAX_POLAR - t.polar) * tk

      const scene = useSceneStore.getState()
      const zoomedIn = v.z > VIEW_ZOOMED_AT
      if (zoomedIn !== scene.zoomedIn) scene.setZoomedIn(zoomedIn)

      const args = viewLookAt(home, v.z, v.p, t)
      const key = `${args.map((n) => n.toFixed(4)).join()}|${v.z.toFixed(4)}`
      if (key === applied.current) return null
      applied.current = key
      return { args, zoom: baseZoom * v.z }
    },
    [frame, reducedMotion],
  )

  // The HUD's "Reset view" button.
  useEffect(
    () =>
      useSceneStore.subscribe((s, prev) => {
        if (s.resetViewTick !== prev.resetViewTick) reset()
      }),
    [reset],
  )

  // Input on the canvas: wheel / trackpad pinch zoom, drag to slide, touch pinch.
  useEffect(() => {
    // camera-controls already sets touch-action: none on this canvas, so the
    // browser doesn't scroll or zoom the page under a pinch.
    const el = gl.domElement
    const pointers = new Map<number, Pan>()
    let pinch: { distance: number; z: number } | null = null

    const fromCentre = (x: number, y: number): Pan => {
      const rect = el.getBoundingClientRect()
      return {
        x: x - rect.left - rect.width / 2,
        y: -(y - rect.top - rect.height / 2),
      }
    }
    const zoomAt = (z1: number, cursor: Pan) => {
      const { baseZoom, half } = frame()
      const v = view.current
      v.pTarget = clampPan(
        zoomTowardCursor(v.pTarget, cursor, v.zTarget, z1, baseZoom),
        z1,
        half,
      )
      v.zTarget = z1
    }
    const twoPointers = () => {
      const [a, b] = [...pointers.values()]
      return {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (!isActive()) return
      e.preventDefault()
      const deltaY = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      zoomAt(
        wheelZoom(view.current.zTarget, deltaY, e.ctrlKey),
        fromCentre(e.clientX, e.clientY),
      )
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2)
        pinch = { distance: twoPointers().distance, z: view.current.zTarget }
    }
    const onMove = (e: PointerEvent) => {
      const last = pointers.get(e.pointerId)
      if (!last) return
      const now = { x: e.clientX, y: e.clientY }
      if (isActive()) {
        const v = view.current
        if (pointers.size === 1 && v.z > VIEW_ZOOMED_AT) {
          // Drag slides the room under the pointer, 1:1.
          const { baseZoom, half } = frame()
          const scale = 1 / (baseZoom * v.z)
          v.pTarget = clampPan(
            {
              x: v.pTarget.x - (now.x - last.x) * scale,
              y: v.pTarget.y + (now.y - last.y) * scale,
            },
            v.zTarget,
            half,
          )
          v.p = clampPan(v.pTarget, v.z, half)
        } else if (pointers.size === 2 && pinch && pinch.distance > 0) {
          pointers.set(e.pointerId, now)
          const { distance, mid } = twoPointers()
          zoomAt(
            clampZoom((pinch.z * distance) / pinch.distance),
            fromCentre(mid.x, mid.y),
          )
          return
        }
      }
      pointers.set(e.pointerId, now)
    }
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) pinch = null
    }
    const onDoubleClick = () => {
      if (isActive()) reset()
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    el.addEventListener('dblclick', onDoubleClick)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      el.removeEventListener('dblclick', onDoubleClick)
    }
  }, [gl, isActive, frame, reset])

  return { step, target, settle, reset }
}
