'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'

export default function Tv() {
  const p = roomLayout.tv
  return (
    <group position={[...p.position]} rotation={[0, p.rotationY ?? 0, 0]}>
      <Interactive
        id="tv"
        label="Gaming"
        hitSize={[1.6, 1.5, 0.8]}
        hitOffset={[0, 0.7, 0.1]}
        labelHeight={1.6}
        onActivate={() => openFromScene('gaming')}
      >
        <RoundedBox
          args={[1.4, 0.5, 0.5]}
          radius={0.05}
          position={[0, 0.25, 0]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.woodDark)} />
        </RoundedBox>
        <RoundedBox
          args={[1.3, 0.8, 0.08]}
          radius={0.04}
          position={[0, 0.95, 0]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.ink)} />
        </RoundedBox>
        <mesh
          name="tvScreen"
          position={[0, 0.95, 0.045]}
          userData={{ noHighlight: true }}
        >
          <planeGeometry args={[1.2, 0.7]} />
          <meshStandardMaterial
            color={palette.screen}
            emissive={palette.mint}
            emissiveIntensity={0.35}
            roughness={0.5}
          />
        </mesh>
        <RoundedBox
          args={[0.32, 0.08, 0.26]}
          radius={0.03}
          position={[-0.4, 0.54, 0.05]}
        >
          <meshStandardMaterial {...clay(palette.cream)} />
        </RoundedBox>
        <RoundedBox
          args={[0.22, 0.06, 0.12]}
          radius={0.03}
          position={[0.35, 0.53, 0.15]}
          rotation={[0, 0.4, 0]}
        >
          <meshStandardMaterial {...clay(palette.lavender)} />
        </RoundedBox>
      </Interactive>
    </group>
  )
}
