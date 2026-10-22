'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

import { useSceneStore } from '@store/useSceneStore'

import { RAIN_FADE_SECONDS } from '@constants/weather'
import { approach } from '@utils/sky'

/** How much rain the window shows, 0 to 1, easing with the weather (instantly with reduced motion). */
export function useRainAmount(reducedMotion: boolean) {
  const amount = useRef(0)
  useFrame((_, dt) => {
    const target = useSceneStore.getState().weather === 'rain' ? 1 : 0
    amount.current = reducedMotion
      ? target
      : approach(amount.current, target, dt / RAIN_FADE_SECONDS)
  })
  return amount
}
