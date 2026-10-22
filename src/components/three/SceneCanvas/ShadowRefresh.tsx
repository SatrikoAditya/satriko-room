'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { Material, Mesh } from 'three'

import { useSceneStore } from '@store/useSceneStore'

/**
 * Turning the shadow map off (the low tier) leaves compiled materials sampling
 * its last frame, so shadows freeze in place. Recompile them on every tier change.
 */
export default function ShadowRefresh() {
  const tier = useSceneStore((s) => s.tier)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    scene.traverse((object) => {
      const material = (object as Mesh).material as
        Material | Material[] | undefined
      if (!material) return
      for (const m of Array.isArray(material) ? material : [material])
        m.needsUpdate = true
    })
  }, [tier, scene])
  return null
}
