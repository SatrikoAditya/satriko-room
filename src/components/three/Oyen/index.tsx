'use client'

import { Html } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'
import { useSceneBridge } from '@components/three/SceneCanvas/SceneBridge'

import { useSceneStore } from '@store/useSceneStore'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { oyenLines } from '@content/oyen'

import { useOyenAnimation } from './useOyenAnimation'

let chatterIndex = 0
const O = palette.orange
const OD = palette.orangeDark

export default function Oyen() {
  const asleep = useSceneStore((s) => s.theme === 'night')
  const { reducedMotion } = useSceneBridge()
  const { body, head, tail, eyes } = useOyenAnimation(asleep, reducedMotion)
  const place = asleep ? roomLayout.oyenNight : roomLayout.oyen
  const speak = () => {
    const s = useSceneStore.getState()
    if (asleep) return s.setBubble(oyenLines.sleeping)
    s.setBubble(oyenLines.chatter[chatterIndex % oyenLines.chatter.length])
    chatterIndex += 1
  }
  return (
    <group
      position={[...place.position]}
      rotation={[0, place.rotationY ?? 0, 0]}
    >
      <Interactive
        id="oyen"
        label="Oyen"
        hitSize={[0.9, 0.8, 1.1]}
        hitOffset={[0, 0.35, 0]}
        labelHeight={0.95}
        onActivate={speak}
      >
        <group ref={body}>
          <mesh
            position={[0, 0.3, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.26, 0.4, 8, 16]} />
            <meshStandardMaterial {...clay(O)} />
          </mesh>
          <mesh position={[0, 0.22, 0.2]} scale={[1, 0.7, 1]}>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshStandardMaterial {...clay(palette.cream)} />
          </mesh>
          {[-0.14, 0.14].map((x) => (
            <mesh key={x} position={[x, 0.07, 0.32]} castShadow>
              <sphereGeometry args={[0.08, 12, 8]} />
              <meshStandardMaterial {...clay(O)} />
            </mesh>
          ))}
          <group ref={head} position={[0, 0.55, 0.3]}>
            <mesh castShadow scale={[1, 0.92, 1]}>
              <sphereGeometry args={[0.27, 20, 16]} />
              <meshStandardMaterial {...clay(O)} />
            </mesh>
            {[-0.16, 0.16].map((x) => (
              <mesh
                key={x}
                position={[x, 0.22, 0]}
                rotation={[0, 0, x > 0 ? -0.3 : 0.3]}
              >
                <coneGeometry args={[0.08, 0.16, 4]} />
                <meshStandardMaterial {...clay(OD)} />
              </mesh>
            ))}
            {[-0.1, 0.1].map((x, i) => (
              <mesh
                key={x}
                ref={(m) => {
                  if (m) eyes.current[i] = m
                }}
                position={[x, 0.03, 0.24]}
                userData={{ noHighlight: true }}
              >
                <sphereGeometry args={[0.04, 10, 8]} />
                <meshStandardMaterial color={palette.ink} roughness={0.3} />
              </mesh>
            ))}
            <mesh position={[0, -0.05, 0.27]} userData={{ noHighlight: true }}>
              <sphereGeometry args={[0.025, 8, 6]} />
              <meshStandardMaterial color={palette.nose} roughness={0.5} />
            </mesh>
          </group>
          {Array.from({ length: 5 }, (_, i) => (
            <group
              key={i}
              ref={(g) => {
                if (g) tail.current[i] = g
              }}
              position={[0, 0.34 + i * 0.07, -0.42 - i * 0.1]}
            >
              <mesh castShadow>
                <sphereGeometry args={[0.07 - i * 0.006, 10, 8]} />
                <meshStandardMaterial {...clay(i === 4 ? OD : O)} />
              </mesh>
            </group>
          ))}
        </group>
        {asleep && (
          <Html
            center
            position={[0.3, 0.9, 0]}
            zIndexRange={[10, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <span className="font-display text-ink-muted text-sm font-bold">
              Zzz
            </span>
          </Html>
        )}
      </Interactive>
    </group>
  )
}
