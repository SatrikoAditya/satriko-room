'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { useSceneBridge } from '@components/three/SceneCanvas/SceneBridge'

import { useSceneStore } from '@store/useSceneStore'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'

export default function LightSwitch() {
  const { toggleTheme } = useSceneBridge()
  const night = useSceneStore((s) => s.theme === 'night')
  return (
    <group position={[...roomLayout['light-switch'].position]}>
      <Interactive
        id="light-switch"
        label={night ? 'Lights: off' : 'Lights: on'}
        hitSize={[0.5, 0.5, 0.3]}
        hitOffset={[0, 0, 0.1]}
        labelHeight={0.35}
        onActivate={toggleTheme}
      >
        <RoundedBox
          args={[0.16, 0.22, 0.03]}
          radius={0.02}
          position={[0, 0, 0.015]}
        >
          <meshStandardMaterial {...clay(palette.cream)} />
        </RoundedBox>
        <RoundedBox
          name="switchToggle"
          args={[0.06, 0.1, 0.05]}
          radius={0.015}
          position={[0, night ? -0.03 : 0.03, 0.05]}
          rotation={[night ? 0.3 : -0.3, 0, 0]}
        >
          <meshStandardMaterial {...clay(palette.ink)} />
        </RoundedBox>
      </Interactive>
    </group>
  )
}
