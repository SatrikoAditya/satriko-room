'use client'

import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'

import {
  OYEN_STOP_SECONDS,
  OYEN_STRETCH_MS,
  OYEN_TURN_SPEED,
  OYEN_WALK_SPEED,
  oyenSpots,
  type OyenSpotId,
} from '@constants/oyen'
import { roomLayout } from '@constants/roomLayout'
import type { OyenState } from '@interfaces/ui'
import { currentSlug } from '@utils/history'

import {
  angleDelta,
  hopsBeforeRest,
  nextPause,
  nextSpot,
  shouldWander,
  stepToward,
  yawToward,
  type Pause,
} from './wander'

export type OyenBehaviour =
  'sit' | 'walk' | 'look' | 'groom' | 'loaf' | 'stretch'

export interface OyenWander {
  /** The pose Oyen should show this frame (read by useOyenAnimation). */
  behaviour: RefObject<OyenBehaviour>
  /** Walking speed from 0 (standing) to 1 (full speed). */
  speed: RefObject<number>
  /** Turn toward the camera once Oyen has stopped (after a click on Oyen). */
  faceCamera: () => void
  /** Back to the daytime seat (after night mode). */
  reset: () => void
}

interface Walk {
  position: [number, number]
  yaw: number
  spot: OyenSpotId
  previous: OyenSpotId | null
  target: OyenSpotId | null
  mode: 'idle' | 'walk' | 'pause' | 'stretch'
  pause: Pause | null
  until: number
  hopsSinceRest: number
  restAfter: number
  faceCamera: boolean
}

const HOME = oyenSpots.home
const HOME_YAW = roomLayout.oyen.rotationY ?? 0

const freshWalk = (): Walk => ({
  position: [HOME[0], HOME[1]],
  yaw: HOME_YAW,
  spot: 'home',
  previous: null,
  target: null,
  mode: 'idle',
  pause: null,
  until: 0,
  hopsSinceRest: 0,
  restAfter: hopsBeforeRest(Math.random),
  faceCamera: false,
})

function arrive(w: Walk, now: number) {
  w.previous = w.spot
  w.spot = w.target!
  w.target = null
  w.hopsSinceRest += 1
  const pause = nextPause(w.hopsSinceRest, w.restAfter, Math.random)
  if (pause.longRest) {
    w.hopsSinceRest = 0
    w.restAfter = hopsBeforeRest(Math.random)
  }
  w.pause = pause
  w.mode = 'pause'
  w.until = now + pause.durationMs
}

/**
 * Moves Oyen's root group around the room while the visitor is quiet, by day.
 * Writes the transform directly each frame, so wandering never re-renders React.
 */
/** Returns the ref for Oyen's root group (moved by day) and the wander controls. */
export function useOyenWander(reducedMotion: boolean): {
  root: RefObject<Group | null>
  wander: OyenWander
} {
  const root = useRef<Group>(null)
  const walk = useRef<Walk | null>(null)
  const behaviour = useRef<OyenBehaviour>('sit')
  const speed = useRef(0)
  const reported = useRef<OyenState>('sitting')

  const api = useMemo<OyenWander>(
    () => ({
      behaviour,
      speed,
      faceCamera: () => {
        walk.current ??= freshWalk()
        walk.current.faceCamera = true
      },
      reset: () => {
        walk.current = freshWalk()
        behaviour.current = 'sit'
        speed.current = 0
      },
    }),
    [],
  )

  useFrame((state, dt) => {
    const group = root.current
    const scene = useSceneStore.getState()
    const report = (next: OyenState) => {
      if (next === reported.current) return
      reported.current = next
      scene.setOyenState(next)
    }
    // At night Oyen sleeps on the bed; the component places it there.
    if (!group || scene.theme === 'night') return report('sitting')

    const w = (walk.current ??= freshWalk())
    const room = useRoomStore.getState()
    const now = performance.now()
    const wandering = shouldWander({
      now,
      lastActivity: scene.lastActivity,
      ready: room.phase === 'ready',
      panelOpen: room.transition !== 'idle' || currentSlug() !== null,
      talking: scene.bubble !== null,
      night: false,
      reducedMotion,
    })

    const advance = () => {
      const step = stepToward(
        w.position,
        w.yaw,
        oyenSpots[w.target!],
        dt,
        OYEN_WALK_SPEED * speed.current,
      )
      w.position = step.position
      w.yaw = step.yaw
      if (step.arrived) arrive(w, now)
    }

    if (!wandering) {
      // Ease to a halt on the current path, then sit and watch.
      speed.current = Math.max(0, speed.current - dt / OYEN_STOP_SECONDS)
      if (w.mode === 'walk' && w.target && speed.current > 0) {
        advance()
        // Still moving while it eases to a halt.
        report('walking')
      } else {
        w.mode = 'idle'
        behaviour.current = 'sit'
        if (w.faceCamera) {
          const turn = angleDelta(
            w.yaw,
            yawToward(w.position, [
              state.camera.position.x,
              state.camera.position.z,
            ]),
          )
          const maxTurn = OYEN_TURN_SPEED * dt
          w.yaw += Math.max(-maxTurn, Math.min(maxTurn, turn))
        }
        report('sitting')
      }
    } else {
      w.faceCamera = false
      if (w.mode === 'idle') {
        w.target ??= nextSpot(w.spot, w.previous, Math.random)
        w.mode = 'walk'
      }
      if (w.mode === 'walk') {
        speed.current = Math.min(1, speed.current + dt / OYEN_STOP_SECONDS)
        advance()
      } else {
        speed.current = 0
        if (now >= w.until) {
          // A loaf ends with a stretch before the next walk.
          if (w.mode === 'pause' && w.pause?.behaviour === 'loaf') {
            w.mode = 'stretch'
            w.until = now + OYEN_STRETCH_MS
          } else w.mode = 'idle'
        }
      }
      behaviour.current =
        w.mode === 'walk'
          ? 'walk'
          : w.mode === 'pause'
            ? (w.pause?.behaviour ?? 'look')
            : w.mode === 'stretch'
              ? 'stretch'
              : 'sit'
      report(w.mode === 'walk' ? 'walking' : 'resting')
    }

    group.position.set(w.position[0], 0, w.position[1])
    group.rotation.y = w.yaw
  })

  return { root, wander: api }
}
