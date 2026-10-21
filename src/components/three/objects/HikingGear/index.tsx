'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'

export default function HikingGear() {
  return (
    <group
      position={[...roomLayout['hiking-gear'].position]}
      rotation={[0, -0.4, 0]}
    >
      <Interactive
        id="hiking-gear"
        label="Hiking"
        hitSize={[1.0, 0.9, 0.8]}
        hitOffset={[0, 0.4, 0]}
        labelHeight={1.0}
        onActivate={() => openFromScene('hiking')}
      >
        <RoundedBox
          args={[0.5, 0.7, 0.3]}
          radius={0.09}
          position={[0, 0.35, 0]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.terracotta)} />
        </RoundedBox>
        <RoundedBox
          args={[0.36, 0.26, 0.12]}
          radius={0.05}
          position={[0, 0.22, 0.18]}
        >
          <meshStandardMaterial {...clay(palette.orangeDark)} />
        </RoundedBox>
        <RoundedBox
          args={[0.3, 0.14, 0.34]}
          radius={0.05}
          position={[0, 0.74, 0]}
        >
          <meshStandardMaterial {...clay(palette.orangeDark)} />
        </RoundedBox>
        {[-0.22, 0.22].map((x) => (
          <group key={x} position={[0.45, 0, x]}>
            <RoundedBox
              args={[0.3, 0.14, 0.16]}
              radius={0.05}
              position={[0, 0.07, 0]}
              castShadow
            >
              <meshStandardMaterial {...clay(palette.woodDark)} />
            </RoundedBox>
            <RoundedBox
              args={[0.16, 0.2, 0.16]}
              radius={0.05}
              position={[-0.06, 0.2, 0]}
            >
              <meshStandardMaterial {...clay(palette.woodDark)} />
            </RoundedBox>
          </group>
        ))}
      </Interactive>
    </group>
  )
}
