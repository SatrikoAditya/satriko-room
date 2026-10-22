'use client'

import { ContactShadows, RoundedBox } from '@react-three/drei'

import { useSceneStore } from '@store/useSceneStore'

import { palette } from '@constants/roomPalette'

import { clay } from '../materials'
import Decor from './Decor'

export const ROOM = { size: 10, wallHeight: 6, wallThickness: 0.3 } as const

export default function Room() {
  const tier = useSceneStore((s) => s.tier)
  // The low tier draws contact shadows once; redraw while Oyen walks so its
  // shadow follows it (drei draws one more frame when this flips back).
  const oyenWalking = useSceneStore((s) => s.oyenState === 'walking')
  const half = ROOM.size / 2
  const t = ROOM.wallThickness
  return (
    <group>
      <RoundedBox
        args={[ROOM.size, 0.4, ROOM.size]}
        radius={0.08}
        position={[0, -0.2, 0]}
        receiveShadow
      >
        <meshStandardMaterial {...clay(palette.floor)} />
      </RoundedBox>
      <RoundedBox
        args={[ROOM.size + 1, 0.5, ROOM.size + 1]}
        radius={0.15}
        position={[0, -0.65, 0]}
      >
        <meshStandardMaterial {...clay(palette.base)} />
      </RoundedBox>
      <RoundedBox
        args={[t, ROOM.wallHeight, ROOM.size + t]}
        radius={0.06}
        position={[-half - t / 2, ROOM.wallHeight / 2, -t / 2]}
        receiveShadow
      >
        <meshStandardMaterial {...clay(palette.wall)} />
      </RoundedBox>
      <RoundedBox
        args={[ROOM.size + t, ROOM.wallHeight, t]}
        radius={0.06}
        position={[-t / 2, ROOM.wallHeight / 2, -half - t / 2]}
        receiveShadow
      >
        <meshStandardMaterial {...clay(palette.wall)} />
      </RoundedBox>
      <mesh position={[-half + 0.06, 0.15, 0]}>
        <boxGeometry args={[0.12, 0.3, ROOM.size]} />
        <meshStandardMaterial {...clay(palette.wallTrim)} />
      </mesh>
      <mesh position={[0, 0.15, -half + 0.06]}>
        <boxGeometry args={[ROOM.size, 0.3, 0.12]} />
        <meshStandardMaterial {...clay(palette.wallTrim)} />
      </mesh>
      <Decor />
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.35}
        scale={14}
        blur={2.4}
        far={4}
        resolution={tier === 'high' ? 1024 : 512}
        frames={tier === 'high' || oyenWalking ? Infinity : 1}
      />
    </group>
  )
}
