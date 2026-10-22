'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'

import Laptop from './Laptop'

export default function Pc() {
  return (
    <group
      position={[...roomLayout.pc.position]}
      rotation={[0, roomLayout.pc.rotationY ?? 0, 0]}
    >
      <Interactive
        id="pc"
        label="Work experience"
        // Wide enough to take in the laptop on the right.
        hitSize={[2.1, 1.1, 0.9]}
        hitOffset={[0.25, 0.5, 0.2]}
        labelHeight={1.25}
        touchLabelOffset={[0.3, 1.55, 0]}
        onActivate={() => openFromScene('experience')}
      >
        <RoundedBox
          args={[1.2, 0.8, 0.08]}
          radius={0.04}
          position={[0, 0.7, 0]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.ink)} />
        </RoundedBox>
        <mesh
          position={[0, 0.7, 0.045]}
          name="pcScreen"
          userData={{ noHighlight: true }}
        >
          <planeGeometry args={[1.08, 0.68]} />
          <meshStandardMaterial
            color={palette.screen}
            emissive={palette.screenGlow}
            emissiveIntensity={0.5}
            roughness={0.6}
          />
        </mesh>
        <RoundedBox
          args={[0.12, 0.3, 0.12]}
          radius={0.03}
          position={[0, 0.15, 0]}
        >
          <meshStandardMaterial {...clay(palette.ink)} />
        </RoundedBox>
        <RoundedBox
          args={[0.5, 0.05, 0.3]}
          radius={0.02}
          position={[0, 0.025, 0]}
        >
          <meshStandardMaterial {...clay(palette.ink)} />
        </RoundedBox>
        <RoundedBox
          args={[0.9, 0.05, 0.3]}
          radius={0.02}
          position={[0, 0.025, 0.5]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.cream)} />
        </RoundedBox>
        <RoundedBox
          args={[0.14, 0.06, 0.22]}
          radius={0.04}
          position={[0.65, 0.03, 0.5]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.cream)} />
        </RoundedBox>
        <Laptop />
      </Interactive>
    </group>
  )
}
