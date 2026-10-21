'use client'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { clockZones } from '@constants/timezones'
import { openFromScene } from '@utils/history'

// Static hands at 10:10; Task 21 drives them.
export function Clock({ zoneId, x }: { zoneId: string; x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 32]} />
        <meshStandardMaterial {...clay(palette.cream)} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.005]}>
        <torusGeometry args={[0.28, 0.035, 12, 32]} />
        <meshStandardMaterial {...clay(palette.wood)} />
      </mesh>
      <group
        name={`hourHand-${zoneId}`}
        position={[0, 0, 0.04]}
        rotation={[0, 0, -Math.PI * (10 / 6)]}
      >
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.035, 0.16, 0.015]} />
          <meshStandardMaterial {...clay(palette.ink)} />
        </mesh>
      </group>
      <group
        name={`minuteHand-${zoneId}`}
        position={[0, 0, 0.05]}
        rotation={[0, 0, -Math.PI * (2 / 6)]}
      >
        <mesh position={[0, 0.11, 0]}>
          <boxGeometry args={[0.025, 0.22, 0.015]} />
          <meshStandardMaterial {...clay(palette.terracotta)} />
        </mesh>
      </group>
      <mesh position={[0, -0.42, 0]}>
        <boxGeometry args={[0.44, 0.12, 0.03]} />
        <meshStandardMaterial {...clay(palette.wood)} />
      </mesh>
    </group>
  )
}

export default function Clocks() {
  return (
    <group position={[...roomLayout.clocks.position]}>
      <Interactive
        id="clocks"
        label="Remote work"
        hitSize={[2.4, 0.9, 0.3]}
        hitOffset={[0, -0.1, 0.05]}
        labelHeight={0.5}
        onActivate={() => openFromScene('remote-work')}
      >
        {clockZones.map((z, i) => (
          <Clock key={z.id} zoneId={z.id} x={(i - 1) * 0.9} />
        ))}
      </Interactive>
    </group>
  )
}
