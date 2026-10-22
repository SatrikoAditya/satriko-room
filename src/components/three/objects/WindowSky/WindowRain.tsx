'use client'

import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Object3D,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
} from 'three'

import {
  RAIN_STREAKS,
  rainStreak,
  STREAK_LENGTH,
  STREAK_TILT,
} from './rainMotion'

const scratch = new Object3D()

/**
 * Rain inside the window only: an overcast layer in front of the sun or moon
 * (z 0.0605, behind the clouds) and falling streaks just in front of the
 * clouds and behind the bars (z 0.0795). Unlit, so the room light is untouched.
 */
export default function WindowRain({
  width,
  height,
  night,
  amount,
  reducedMotion,
}: {
  width: number
  height: number
  night: boolean
  amount: RefObject<number>
  reducedMotion: boolean
}) {
  const overcast = useRef<Mesh>(null)
  const streaks = useRef<InstancedMesh>(null)

  useFrame((state) => {
    const a = amount.current
    const showing = a > 0.01
    const o = overcast.current
    if (o) {
      o.visible = showing
      ;(o.material as MeshBasicMaterial).opacity = 0.75 * a
    }
    const s = streaks.current
    if (!s) return
    s.visible = showing
    if (!showing) return
    ;(s.material as MeshBasicMaterial).opacity = 0.6 * a
    // With reduced motion the streaks stay still but visible.
    const t = reducedMotion ? 0 : state.clock.elapsedTime
    for (let i = 0; i < RAIN_STREAKS; i++) {
      const p = rainStreak(i, t, width, height)
      scratch.position.set(p.x, p.y, 0)
      scratch.rotation.set(0, 0, -STREAK_TILT)
      scratch.updateMatrix()
      s.setMatrixAt(i, scratch.matrix)
    }
    s.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <mesh ref={overcast} position={[0, 0, 0.0605]} visible={false}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          color={night ? '#151B2E' : '#9AA6B8'}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <instancedMesh
        ref={streaks}
        args={[undefined, undefined, RAIN_STREAKS]}
        position={[0, 0, 0.0795]}
        visible={false}
        frustumCulled={false}
      >
        <planeGeometry args={[0.016, STREAK_LENGTH]} />
        <meshBasicMaterial
          color={night ? '#7F93B8' : '#EAF2FA'}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </>
  )
}
