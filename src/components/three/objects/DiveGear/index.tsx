'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'

export default function DiveGear() {
  return (
    <group
      position={[...roomLayout['dive-gear'].position]}
      rotation={[0, roomLayout['dive-gear'].rotationY ?? 0, 0]}
    >
      <Interactive
        id="dive-gear"
        label="Diving"
        hitSize={[0.9, 1.1, 0.7]}
        hitOffset={[0, 0.5, 0]}
        // Higher than the backpack's tag beside it, so the two don't overlap on
        // phones, where every tag is always shown.
        labelHeight={1.95}
        onActivate={() => openFromScene('diving')}
      >
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
          <meshStandardMaterial {...clay(palette.woodDark)} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.22, 0.24, 0.04, 16]} />
          <meshStandardMaterial {...clay(palette.woodDark)} />
        </mesh>
        <mesh position={[0, 0.85, 0.05]}>
          <torusGeometry args={[0.16, 0.045, 12, 24]} />
          <meshStandardMaterial {...clay(palette.ink)} />
        </mesh>
        <mesh position={[0, 0.85, 0.05]} userData={{ noHighlight: true }}>
          <circleGeometry args={[0.14, 24]} />
          <meshStandardMaterial
            color={palette.sky}
            roughness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>
        {[-0.14, 0.14].map((x) => (
          <RoundedBox
            key={x}
            args={[0.16, 0.5, 0.04]}
            radius={0.03}
            position={[x, 0.3, -0.1]}
            rotation={[0.15, 0, x > 0 ? 0.1 : -0.1]}
          >
            <meshStandardMaterial {...clay(palette.mint)} />
          </RoundedBox>
        ))}
      </Interactive>
    </group>
  )
}
