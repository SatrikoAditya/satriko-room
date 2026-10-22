'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshStandardMaterial } from 'three'

import { useSceneBridge } from '@components/three/SceneCanvas/SceneBridge'

import { useSceneStore } from '@store/useSceneStore'

import type { Vec3 } from '@interfaces/section'

import { BUBBLE_COUNT, bubbleAt } from './bubbleMotion'

const SIZES = [0.04, 0.03, 0.045, 0.032, 0.038, 0.028]
// Light sky blue with a faint glow, so they show against the cream wall by day and night.
const BUBBLE_COLOR = '#BFE3F7'
const ignoreRaycast = () => null

/** A few bubbles rise from the regulator while the dive gear is hovered, then die away when it isn't. */
export default function Bubbles({ origin }: { origin: Vec3 }) {
  const group = useRef<Group>(null)
  // Eases to 1 on hover and back to 0, so the bubbles fade out instead of vanishing.
  const strength = useRef(0)
  const { reducedMotion } = useSceneBridge()

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const on =
      !reducedMotion && useSceneStore.getState().hovered === 'dive-gear'
    strength.current += ((on ? 1 : 0) - strength.current) * Math.min(1, dt * 6)
    g.visible = strength.current > 0.01
    if (!g.visible) return
    const t = state.clock.elapsedTime
    g.children.forEach((child, i) => {
      const b = bubbleAt(t, i)
      const mesh = child as Mesh
      mesh.position.set(b.x, b.y, 0)
      mesh.scale.setScalar(b.scale)
      ;(mesh.material as MeshStandardMaterial).opacity =
        b.opacity * strength.current * 0.9
    })
  })

  return (
    <group ref={group} position={[...origin]} visible={false}>
      {Array.from({ length: BUBBLE_COUNT }, (_, i) => (
        <mesh key={i} raycast={ignoreRaycast} userData={{ noHighlight: true }}>
          <sphereGeometry args={[SIZES[i % SIZES.length], 12, 8]} />
          <meshStandardMaterial
            color={BUBBLE_COLOR}
            emissive={BUBBLE_COLOR}
            emissiveIntensity={0.25}
            roughness={0.15}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
