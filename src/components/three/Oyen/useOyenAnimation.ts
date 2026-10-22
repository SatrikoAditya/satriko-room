'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { Vector3 } from 'three'

import { useSceneStore } from '@store/useSceneStore'

import type { OyenWander } from './useOyenWander'

const headWorld = new Vector3()

/** Paw rest positions [x, y, z]: front left, front right, back left, back right. */

/** From the head's centre to just above its ears, in world units. */
const BUBBLE_ABOVE_HEAD = 0.38
export const PAW_BASE = [
  [-0.14, 0.07, 0.32],
  [0.14, 0.07, 0.32],
  [-0.14, 0.07, -0.25],
  [0.14, 0.07, -0.25],
] as const
/** Diagonal paws step together: front left with back right. */
const PAW_PHASE = [0, Math.PI, Math.PI, 0]
/** Stride cycle in radians per second at full walking speed. */
const STRIDE_RATE = 9
/** Tail segment heights at rest (see Oyen/index.tsx). */
const tailY = (i: number) => 0.34 + i * 0.07
/** How fast poses blend into each other. */
const POSE_BLEND = 6

interface Pose {
  walk: number
  loaf: number
  groom: number
  stretch: number
}

export function useOyenAnimation(
  asleep: boolean,
  reducedMotion: boolean,
  wander: OyenWander,
) {
  const body = useRef<Group>(null)
  const head = useRef<Group>(null)
  const tail = useRef<Group[]>([])
  const eyes = useRef<Mesh[]>([])
  const paws = useRef<Mesh[]>([])
  const blink = useRef({ next: 2 })
  const last = useRef({ x: -1, y: -1 })
  const pose = useRef<Pose>({ walk: 0, loaf: 0, groom: 0, stretch: 0 })
  const stride = useRef(0)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const behaviour = asleep ? 'sit' : wander.behaviour.current
    const p = pose.current
    const k = Math.min(1, dt * POSE_BLEND)
    const blend = (key: keyof Pose, target: number) => {
      p[key] += (target - p[key]) * k
    }
    blend('walk', behaviour === 'walk' ? wander.speed.current : 0)
    blend('loaf', behaviour === 'loaf' ? 1 : 0)
    blend('groom', behaviour === 'groom' ? 1 : 0)
    blend('stretch', behaviour === 'stretch' ? 1 : 0)
    stride.current += dt * STRIDE_RATE * p.walk

    if (body.current) {
      const breath = reducedMotion ? 1 : 1 + Math.sin(t * 2.1) * 0.02
      body.current.scale.set(breath, asleep ? breath * 0.8 : breath, breath)
      body.current.position.y =
        -0.08 * p.loaf + Math.abs(Math.sin(stride.current)) * 0.015 * p.walk
      // A positive tilt lowers the front: the stretch after a loaf.
      body.current.rotation.x = 0.22 * p.stretch
    }

    paws.current.forEach((paw, i) => {
      if (!paw) return
      const [x, y, z] = PAW_BASE[i]
      const phase = stride.current + PAW_PHASE[i]
      const front = i < 2
      const raised = i === 0 ? p.groom : 0 // grooming lifts the front-left paw
      paw.position.set(
        x,
        y + Math.max(0, Math.cos(phase)) * 0.05 * p.walk + 0.14 * raised,
        z +
          Math.sin(phase) * 0.07 * p.walk +
          (front ? -0.06 : 0.06) * p.loaf +
          0.06 * raised,
      )
    })

    tail.current.forEach((seg, i) => {
      if (!seg) return
      if (!reducedMotion)
        seg.rotation.y = Math.sin(t * 2.4 + i * 0.6) * (asleep ? 0.08 : 0.28)
      // The tail lifts while walking and drops when lying down.
      seg.position.y = tailY(i) + i * (0.025 * p.walk - 0.02 * p.loaf)
    })

    if (head.current) {
      let targetY = Math.max(-0.52, Math.min(0.52, state.pointer.x * 0.5))
      let targetX = Math.max(-0.3, Math.min(0.3, -state.pointer.y * 0.3))
      if (asleep) {
        targetY = 0.3
        targetX = 0.5
      } else if (behaviour === 'walk') {
        targetY = 0
        targetX = 0.05
      } else if (behaviour === 'look') {
        targetY = Math.sin(t * 0.9) * 0.6
        targetX = -0.05
      } else if (behaviour === 'groom') {
        targetY = -0.35
        targetX = 0.45 + Math.sin(t * 9) * 0.05
      } else if (behaviour === 'loaf') {
        targetY *= 0.5
        targetX = 0.15
      }
      head.current.rotation.y +=
        (targetY - head.current.rotation.y) * Math.min(1, dt * 5)
      head.current.rotation.x +=
        (targetX - head.current.rotation.x) * Math.min(1, dt * 5)
      head.current.position.y = 0.55 - 0.08 * p.loaf

      // Publish the head's screen position only while a bubble needs it
      // (and once at the start), not on every frame Oyen moves.
      const scene = useSceneStore.getState()
      if (scene.bubble !== null || scene.oyenAnchor === null) {
        // The bubble points at the top of the head, just clear of the ears.
        head.current.getWorldPosition(headWorld)
        headWorld.y += BUBBLE_ABOVE_HEAD
        headWorld.project(state.camera)
        const x = ((headWorld.x + 1) / 2) * state.size.width
        const y = ((1 - headWorld.y) / 2) * state.size.height
        if (
          Math.abs(x - last.current.x) >= 1 ||
          Math.abs(y - last.current.y) >= 1
        ) {
          last.current = { x, y }
          scene.setOyenAnchor({ x, y })
        }
      }
    }

    // Blinks every 3–6 s; a loafing cat looks sleepy.
    const blinking = t > blink.current.next && t - blink.current.next < 0.12
    if (t - blink.current.next >= 0.12)
      blink.current.next = t + 3 + Math.random() * 3
    const open = 1 - 0.55 * p.loaf
    eyes.current.forEach((e) => {
      if (e) e.scale.y = asleep || blinking ? 0.1 : open
    })
  })
  return { body, head, tail, eyes, paws }
}
