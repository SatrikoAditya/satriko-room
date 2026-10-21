'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { Vector3 } from 'three'

import { useSceneStore } from '@store/useSceneStore'

const headWorld = new Vector3()

export function useOyenAnimation(asleep: boolean, reducedMotion: boolean) {
  const body = useRef<Group>(null)
  const head = useRef<Group>(null)
  const tail = useRef<Group[]>([])
  const eyes = useRef<Mesh[]>([])
  const blink = useRef({ next: 2, closing: false })
  const last = useRef({ x: -1, y: -1 })
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (body.current && !reducedMotion) {
      const s = 1 + Math.sin(t * 2.1) * 0.02
      body.current.scale.set(s, asleep ? s * 0.8 : s, s)
    }
    tail.current.forEach((seg, i) => {
      if (seg && !reducedMotion)
        seg.rotation.y = Math.sin(t * 2.4 + i * 0.6) * (asleep ? 0.08 : 0.28)
    })
    if (head.current) {
      const targetY = asleep
        ? 0.3
        : Math.max(-0.52, Math.min(0.52, state.pointer.x * 0.5))
      const targetX = asleep
        ? 0.5
        : Math.max(-0.3, Math.min(0.3, -state.pointer.y * 0.3))
      head.current.rotation.y +=
        (targetY - head.current.rotation.y) * Math.min(1, dt * 5)
      head.current.rotation.x +=
        (targetX - head.current.rotation.x) * Math.min(1, dt * 5)
      head.current.getWorldPosition(headWorld).project(state.camera)
      const x = ((headWorld.x + 1) / 2) * state.size.width
      const y = ((1 - headWorld.y) / 2) * state.size.height
      if (
        Math.abs(x - last.current.x) >= 1 ||
        Math.abs(y - last.current.y) >= 1
      ) {
        last.current = { x, y }
        useSceneStore.getState().setOyenAnchor({ x, y })
      }
    }
    if (t > blink.current.next || asleep) {
      const closed = asleep || t - blink.current.next < 0.12
      eyes.current.forEach((e) => {
        if (e) e.scale.y = closed ? 0.1 : 1
      })
      if (!asleep && t - blink.current.next > 0.12)
        blink.current.next = t + 3 + Math.random() * 3
    }
  })
  return { body, head, tail, eyes }
}
