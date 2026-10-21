'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { education } from '@content/education'
import { openFromScene } from '@utils/history'

// Title bar and two text lines, so each frame reads as a certificate: [width, height, y].
const CERT_LINES = [
  [0.3, 0.05, 0.2],
  [0.32, 0.022, 0.07],
  [0.24, 0.022, 0.0],
] as const

export default function EduFrames() {
  return (
    <group
      position={[...roomLayout['edu-frames'].position]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <Interactive
        id="edu-frames"
        label="Education"
        hitSize={[2.4, 1.0, 0.3]}
        hitOffset={[0, 0, 0.05]}
        labelHeight={0.7}
        onActivate={() => openFromScene('education')}
      >
        {education.map((e, i) => (
          <group key={e.id} position={[(i - 1) * 0.8, 0, 0]}>
            <RoundedBox args={[0.6, 0.8, 0.06]} radius={0.02}>
              <meshStandardMaterial {...clay(palette.wood)} />
            </RoundedBox>
            <mesh position={[0, 0, 0.035]} userData={{ noHighlight: true }}>
              <planeGeometry args={[0.48, 0.66]} />
              <meshStandardMaterial {...clay(palette.paper)} />
            </mesh>
            {CERT_LINES.map(([w, h, y]) => (
              <mesh
                key={y}
                position={[0, y, 0.037]}
                userData={{ noHighlight: true }}
              >
                <planeGeometry args={[w, h]} />
                <meshStandardMaterial {...clay(palette.woodDark)} />
              </mesh>
            ))}
            {e.honors && (
              <mesh
                position={[0.18, -0.2, 0.05]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
                <meshStandardMaterial {...clay(palette.terracotta)} />
              </mesh>
            )}
          </group>
        ))}
      </Interactive>
    </group>
  )
}
