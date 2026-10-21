'use client'

import { RoundedBox, useTexture } from '@react-three/drei'
import { SRGBColorSpace } from 'three'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { about } from '@content/about'
import { openFromScene } from '@utils/history'

function Photo({ src }: { src: string }) {
  const map = useTexture(src, (t) => {
    const tex = Array.isArray(t) ? t : [t]
    tex.forEach((x) => {
      x.colorSpace = SRGBColorSpace
    })
  })
  return (
    <mesh position={[0, 0.3, 0.03]} userData={{ noHighlight: true }}>
      <planeGeometry args={[0.38, 0.46]} />
      <meshStandardMaterial map={map} roughness={0.8} />
    </mesh>
  )
}

export default function PhotoFrame() {
  const p = roomLayout['photo-frame']
  return (
    <group position={[...p.position]} rotation={[0, p.rotationY ?? 0, 0]}>
      <Interactive
        id="photo-frame"
        label="About me"
        hitSize={[0.7, 0.75, 0.5]}
        hitOffset={[0, 0.3, 0]}
        labelHeight={0.85}
        onActivate={() => openFromScene('about')}
      >
        <RoundedBox
          args={[0.5, 0.6, 0.05]}
          radius={0.03}
          position={[0, 0.3, 0]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.wood)} />
        </RoundedBox>
        {about.photo ? (
          <Photo src={about.photo.src} />
        ) : (
          <mesh position={[0, 0.3, 0.03]} userData={{ noHighlight: true }}>
            <planeGeometry args={[0.38, 0.46]} />
            <meshStandardMaterial {...clay(palette.peach)} />
          </mesh>
        )}
        <RoundedBox
          args={[0.04, 0.4, 0.3]}
          radius={0.015}
          position={[0, 0.2, -0.15]}
          rotation={[0.5, 0, 0]}
        >
          <meshStandardMaterial {...clay(palette.woodDark)} />
        </RoundedBox>
      </Interactive>
    </group>
  )
}
