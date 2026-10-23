'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { useSceneBridge } from '@components/three/SceneCanvas/SceneBridge'

import { useSceneStore } from '@store/useSceneStore'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { oyenLines } from '@content/oyen'

const STAND_HEIGHT = 0.45
const STAND_RADIUS = 0.15
/** The umbrella rests a little tilted in the stand. */
const LEAN = 0.12

/** An easter egg: Bogor is the City of Rain. Clicking the umbrella calls the rain. */
export default function UmbrellaStand() {
  const umbrella = useRef<Group>(null)
  // 1 right after a click, easing back to 0: a short wiggle.
  const wiggle = useRef(0)
  const { reducedMotion } = useSceneBridge()

  useFrame((state, dt) => {
    const u = umbrella.current
    if (!u) return
    wiggle.current = Math.max(0, wiggle.current - dt * 1.5)
    u.rotation.z =
      LEAN + Math.sin(state.clock.elapsedTime * 18) * 0.12 * wiggle.current
  })

  const callRain = () => {
    const scene = useSceneStore.getState()
    scene.callRain()
    scene.setBubble(
      scene.theme === 'night' ? oyenLines.rainSleeping : oyenLines.rain,
    )
    if (!reducedMotion) wiggle.current = 1
  }

  return (
    <group position={[...roomLayout['umbrella-stand'].position]}>
      <Interactive
        id="umbrella-stand"
        label="Umbrella"
        hitSize={[0.5, 1.0, 0.45]}
        hitOffset={[0, 0.5, 0.05]}
        labelHeight={1.15}
        // Low on phones, under the door's Contact tag.
        touchLabelOffset={[0, -0.75, 0]}
        onActivate={callRain}
      >
        {/* brass stand on a dark wooden foot, open at the top */}
        <mesh position={[0, 0.025, 0]} castShadow>
          <cylinderGeometry
            args={[STAND_RADIUS + 0.02, STAND_RADIUS + 0.03, 0.05, 20]}
          />
          <meshStandardMaterial {...clay(palette.woodDark)} />
        </mesh>
        <mesh position={[0, STAND_HEIGHT / 2 + 0.03, 0]} castShadow>
          <cylinderGeometry
            args={[STAND_RADIUS, STAND_RADIUS - 0.02, STAND_HEIGHT - 0.03, 20]}
          />
          <meshStandardMaterial {...clay(palette.brass)} />
        </mesh>
        <mesh
          position={[0, STAND_HEIGHT + 0.015, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[STAND_RADIUS, 0.015, 8, 24]} />
          <meshStandardMaterial {...clay(palette.brass)} />
        </mesh>
        <mesh
          position={[0, STAND_HEIGHT + 0.012, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[STAND_RADIUS - 0.01, 20]} />
          <meshStandardMaterial {...clay(palette.ink)} />
        </mesh>
        {/* one closed umbrella, tip down in the stand */}
        <group ref={umbrella} position={[0, 0.2, 0]} rotation={[0, 0, LEAN]}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.018, 0.56, 14]} />
            <meshStandardMaterial {...clay(palette.sky)} />
          </mesh>
          {/* the snap strap round the folded canopy */}
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.064, 0.062, 0.04, 14]} />
            <meshStandardMaterial {...clay(palette.paper)} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <sphereGeometry
              args={[0.081, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial {...clay(palette.sky)} />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
            <meshStandardMaterial {...clay(palette.chairMesh)} />
          </mesh>
          {/* wooden J-handle */}
          <mesh position={[0.055, 0.8, 0]}>
            <torusGeometry args={[0.055, 0.019, 8, 16, Math.PI]} />
            <meshStandardMaterial {...clay(palette.wood)} />
          </mesh>
        </group>
      </Interactive>
    </group>
  )
}
