'use client'

import { RoundedBox } from '@react-three/drei'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'

import { clay } from '../materials'

const SEAT_Y = 0.47
const BACK_TILT = 0.12 // about 7° back
const STAR_ARMS = 5
// The room's furniture is chunkier than life (the desk is 3 units wide), so the
// chair is built at real proportions and scaled up to match.
const CHAIR_SCALE = 1.25

/** Satriko's office chair: grey mesh back and headrest, black seat, arms and five-star base. */
export default function OfficeChair() {
  const { position, rotationY = 0 } = roomLayout.chair
  const frame = clay(palette.chairFrame)
  const mesh = clay(palette.chairMesh)
  return (
    <group
      position={[...position]}
      rotation={[0, rotationY, 0]}
      scale={CHAIR_SCALE}
      name="chair"
    >
      {Array.from({ length: STAR_ARMS }, (_, i) => (
        <group key={i} rotation={[0, (i / STAR_ARMS) * Math.PI * 2, 0]}>
          <RoundedBox
            args={[0.3, 0.04, 0.07]}
            radius={0.02}
            position={[0.17, 0.05, 0]}
            castShadow
          >
            <meshStandardMaterial {...frame} />
          </RoundedBox>
          <mesh position={[0.31, 0.035, 0]} castShadow>
            <sphereGeometry args={[0.035, 10, 8]} />
            <meshStandardMaterial {...frame} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.36, 12]} />
        <meshStandardMaterial {...frame} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
        <meshStandardMaterial {...frame} />
      </mesh>
      <RoundedBox
        args={[0.52, 0.1, 0.5]}
        radius={0.04}
        position={[0, SEAT_Y, 0]}
        castShadow
      >
        <meshStandardMaterial {...frame} />
      </RoundedBox>
      {/* The back and headrest lean back a little; the chair faces -z. */}
      <group position={[0, SEAT_Y + 0.05, 0.22]} rotation={[BACK_TILT, 0, 0]}>
        <RoundedBox
          args={[0.5, 0.64, 0.03]}
          radius={0.015}
          position={[0, 0.33, 0.03]}
          castShadow
        >
          <meshStandardMaterial {...frame} />
        </RoundedBox>
        <RoundedBox
          args={[0.48, 0.6, 0.07]}
          radius={0.04}
          position={[0, 0.33, 0]}
          castShadow
        >
          <meshStandardMaterial {...mesh} />
        </RoundedBox>
        <mesh position={[0, 0.7, 0.02]}>
          <cylinderGeometry args={[0.015, 0.015, 0.14, 8]} />
          <meshStandardMaterial {...frame} />
        </mesh>
        <RoundedBox
          args={[0.3, 0.14, 0.06]}
          radius={0.03}
          position={[0, 0.82, 0]}
          castShadow
        >
          <meshStandardMaterial {...mesh} />
        </RoundedBox>
      </group>
      {[-0.27, 0.27].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <RoundedBox
            args={[0.04, 0.22, 0.04]}
            radius={0.015}
            position={[0, SEAT_Y + 0.14, 0.05]}
          >
            <meshStandardMaterial {...frame} />
          </RoundedBox>
          <RoundedBox
            args={[0.06, 0.03, 0.26]}
            radius={0.015}
            position={[0, SEAT_Y + 0.26, 0]}
            castShadow
          >
            <meshStandardMaterial {...frame} />
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}
