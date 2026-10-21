'use client'

import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'

import { useSceneStore } from '@store/useSceneStore'

export default function SceneReady() {
  const { active, progress } = useProgress()
  useEffect(() => {
    useSceneStore.getState().setProgress(active ? Math.floor(progress) : 100)
  }, [active, progress])
  useEffect(() => {
    const s = useSceneStore.getState()
    s.setSceneReady(true)
    return () => s.setSceneReady(false)
  }, [])
  return null
}
