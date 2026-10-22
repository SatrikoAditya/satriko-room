'use client'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { clockZones } from '@constants/timezones'
import { openFromScene } from '@utils/history'

import { useClockHands } from './useClockHands'

export function Clock({
  zoneId,
  timeZone,
  x,
}: {
  zoneId: string
  timeZone: string
  x: number
}) {
  const { hour, minute } = useClockHands(timeZone)
  return (
    <group position={[x, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 32]} />
        <meshStandardMaterial {...clay(palette.cream)} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <torusGeometry args={[0.28, 0.035, 12, 32]} />
        <meshStandardMaterial {...clay(palette.wood)} />
      </mesh>
      <group name={`hourHand-${zoneId}`} ref={hour} position={[0, 0, 0.04]}>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.035, 0.16, 0.015]} />
          <meshStandardMaterial {...clay(palette.ink)} />
        </mesh>
      </group>
      <group name={`minuteHand-${zoneId}`} ref={minute} position={[0, 0, 0.05]}>
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
        touchLabelOffset={[1.2, 0, 0]}
        onActivate={() => openFromScene('remote-work')}
      >
        {clockZones.map((z, i) => (
          <Clock
            key={z.id}
            zoneId={z.id}
            timeZone={z.timeZone}
            x={(i - 1) * 0.9}
          />
        ))}
      </Interactive>
    </group>
  )
}
