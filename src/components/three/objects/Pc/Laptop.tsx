'use client'

import { RoundedBox } from '@react-three/drei'

import { clay } from '@components/three/materials'

import { palette } from '@constants/roomPalette'

/** The stand raises the back of the laptop, like Satriko's. */
const STAND_TILT = 0.2
/** The lid leans back from upright, so the laptop is open about 120°. */
const LID_LEAN = 0.35

/**
 * Satriko's laptop: open on a slim stand to the right of the monitor, turned a
 * little toward it. Rendered inside the PC's Interactive, so it hovers and
 * clicks as one setup with the monitor, keyboard and mouse. Positions are in
 * the PC group's space (origin on the desk top under the monitor).
 */
export default function Laptop() {
  const frame = clay(palette.chairFrame)
  // To the right of the monitor and a little forward, turned toward it.
  return (
    <group position={[0.88, 0, 0.2]} rotation={[0, -0.35, 0]}>
      <RoundedBox
        args={[0.3, 0.02, 0.24]}
        radius={0.01}
        position={[0, 0.01, 0.04]}
      >
        <meshStandardMaterial {...frame} />
      </RoundedBox>
      <RoundedBox
        args={[0.3, 0.02, 0.28]}
        radius={0.01}
        position={[0, 0.1, -0.03]}
        rotation={[STAND_TILT, 0, 0]}
      >
        <meshStandardMaterial {...frame} />
      </RoundedBox>
      <group position={[0, 0.17, 0]} rotation={[STAND_TILT, 0, 0]}>
        <RoundedBox args={[0.6, 0.03, 0.4]} radius={0.015} castShadow>
          <meshStandardMaterial {...clay(palette.ink)} />
        </RoundedBox>
        <RoundedBox
          args={[0.5, 0.012, 0.19]}
          radius={0.006}
          position={[0, 0.02, 0.03]}
        >
          <meshStandardMaterial {...clay(palette.chairMesh)} />
        </RoundedBox>
        <RoundedBox
          args={[0.14, 0.008, 0.09]}
          radius={0.004}
          position={[0, 0.019, 0.15]}
        >
          <meshStandardMaterial {...clay(palette.chairMesh)} />
        </RoundedBox>
        <group position={[0, 0.015, -0.2]} rotation={[-LID_LEAN, 0, 0]}>
          <RoundedBox
            args={[0.6, 0.4, 0.025]}
            radius={0.012}
            position={[0, 0.2, 0]}
            castShadow
          >
            <meshStandardMaterial {...clay(palette.ink)} />
          </RoundedBox>
          <mesh
            position={[0, 0.2, 0.014]}
            name="pcScreen"
            userData={{ noHighlight: true }}
          >
            <planeGeometry args={[0.54, 0.34]} />
            <meshStandardMaterial
              color={palette.screen}
              emissive={palette.screenGlow}
              emissiveIntensity={0.5}
              roughness={0.6}
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}
