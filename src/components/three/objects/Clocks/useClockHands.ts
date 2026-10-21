'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

import { clockAngles, zonedTime } from '@utils/time'

const deg = Math.PI / 180

export function useClockHands(timeZone: string) {
  const hour = useRef<Group>(null)
  const minute = useRef<Group>(null)
  const last = useRef(-1)
  useFrame(() => {
    const now = Date.now()
    if (now - last.current < 1000) return
    last.current = now
    const a = clockAngles(zonedTime(new Date(now), timeZone))
    if (hour.current) hour.current.rotation.z = -a.hour * deg
    if (minute.current) minute.current.rotation.z = -a.minute * deg
  })
  return { hour, minute }
}
