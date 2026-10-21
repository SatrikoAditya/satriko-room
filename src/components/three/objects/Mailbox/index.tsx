'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'

export default function Mailbox() {
  return (
    <group position={[...roomLayout.mailbox.position]}>
      <Interactive
        id="mailbox"
        label="Contact"
        hitSize={[0.6, 0.6, 0.5]}
        hitOffset={[0, 0, 0.15]}
        labelHeight={0.5}
        onActivate={() => openFromScene('contact')}
      >
        <RoundedBox
          args={[0.32, 0.42, 0.2]}
          radius={0.05}
          position={[0, 0, 0.1]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.terracotta)} />
        </RoundedBox>
        <mesh position={[0, 0.1, 0.205]}>
          <boxGeometry args={[0.2, 0.03, 0.01]} />
          <meshStandardMaterial {...clay(palette.ink)} />
        </mesh>
        <mesh position={[0.2, 0.12, 0.1]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.03, 0.18, 0.02]} />
          <meshStandardMaterial {...clay(palette.mint)} />
        </mesh>
      </Interactive>
    </group>
  )
}
