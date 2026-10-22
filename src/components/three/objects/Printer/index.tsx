'use client'

import { useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { currentSlug, openFromScene } from '@utils/history'

export default function Printer() {
  const sheet = useRef<Mesh>(null)
  useFrame((_, dt) => {
    if (!sheet.current) return
    const target = currentSlug() === 'resume' ? 0.42 : 0.12
    sheet.current.position.z +=
      (target - sheet.current.position.z) * Math.min(1, dt * 4)
  })
  return (
    <group
      position={[...roomLayout.printer.position]}
      rotation={[0, roomLayout.printer.rotationY ?? 0, 0]}
    >
      <Interactive
        id="printer"
        label="Resume"
        hitSize={[1.0, 0.6, 0.9]}
        hitOffset={[0, 0.2, 0.1]}
        labelHeight={0.7}
        touchLabelOffset={[0, -1.0, 0]}
        onActivate={() => openFromScene('resume')}
      >
        <RoundedBox
          args={[0.8, 0.32, 0.6]}
          radius={0.06}
          position={[0, 0.16, 0]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.cream)} />
        </RoundedBox>
        <RoundedBox
          args={[0.6, 0.06, 0.3]}
          radius={0.02}
          position={[0, 0.36, -0.05]}
        >
          <meshStandardMaterial {...clay(palette.ink)} />
        </RoundedBox>
        <mesh
          ref={sheet}
          name="printerSheet"
          position={[0, 0.2, 0.12]}
          rotation={[-0.15, 0, 0]}
          userData={{ noHighlight: true }}
        >
          <planeGeometry args={[0.42, 0.56]} />
          <meshStandardMaterial color="#ffffff" roughness={1} side={2} />
        </mesh>
      </Interactive>
    </group>
  )
}
