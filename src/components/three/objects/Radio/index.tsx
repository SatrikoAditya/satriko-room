'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { useSoundStore } from '@store/useSoundStore'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { audio } from '@utils/audio'

export default function Radio() {
  const music = useSoundStore((s) => s.music)
  const toggle = () => {
    audio.unlock()
    const s = useSoundStore.getState()
    if (!s.music && !s.master) s.setMaster(true)
    s.toggleMusic()
  }
  return (
    <group
      position={[...roomLayout.radio.position]}
      rotation={[0, roomLayout.radio.rotationY ?? 0, 0]}
    >
      <Interactive
        id="radio"
        label={music ? 'Radio: on' : 'Radio'}
        hitSize={[0.7, 0.5, 0.5]}
        hitOffset={[0, 0.15, 0]}
        labelHeight={0.5}
        touchLabelOffset={[0.45, 0, 0]}
        onActivate={toggle}
      >
        <RoundedBox
          args={[0.5, 0.3, 0.25]}
          radius={0.05}
          position={[0, 0.15, 0]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.terracotta)} />
        </RoundedBox>
        <mesh position={[-0.1, 0.15, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 24]} />
          <meshStandardMaterial {...clay(palette.ink)} />
        </mesh>
        <mesh
          position={[0.15, 0.15, 0.13]}
          rotation={[Math.PI / 2, 0, 0]}
          userData={{ noHighlight: true }}
        >
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial
            color={palette.cream}
            emissive={palette.lampGlow}
            emissiveIntensity={music ? 1.2 : 0}
          />
        </mesh>
        <mesh position={[0.2, 0.42, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.3, 6]} />
          <meshStandardMaterial {...clay(palette.ink)} />
        </mesh>
      </Interactive>
    </group>
  )
}
