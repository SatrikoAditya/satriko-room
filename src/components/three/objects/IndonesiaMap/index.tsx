'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'

import { useMapTexture } from './useMapTexture'

export default function IndonesiaMap() {
  const p = roomLayout['indonesia-map']
  const [w, h] = [p.size![0], p.size![1]]
  const map = useMapTexture()
  return (
    <group position={[...p.position]}>
      <Interactive
        id="indonesia-map"
        label="Travel"
        hitSize={[w + 0.2, h + 0.2, 0.3]}
        hitOffset={[0, 0, 0.1]}
        labelHeight={h / 2 + 0.3}
        onActivate={() => openFromScene('travel')}
      >
        <RoundedBox args={[w + 0.12, h + 0.12, 0.06]} radius={0.02}>
          <meshStandardMaterial {...clay(palette.wood)} />
        </RoundedBox>
        <mesh position={[0, 0, 0.035]} userData={{ noHighlight: true }}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={map} roughness={0.9} />
        </mesh>
      </Interactive>
    </group>
  )
}
